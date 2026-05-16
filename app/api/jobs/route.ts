import { NextResponse } from "next/server";
import { prisma, jobPostingSupportsBilingualFields } from "@/lib/prisma";
import { jobStatusFromValue, jobTypeFromLabel } from "@/lib/jobs";
import { Prisma } from "@/app/generated/prisma";

function optionalString(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  return s || null;
}

/** Omit empty optional *_id fields on create (English tab often sends null). */
function optionalIdFields(data: Record<string, unknown>) {
  if (!jobPostingSupportsBilingualFields()) return {};

  const keys = [
    "title_id",
    "department_id",
    "location_id",
    "salaryRange_id",
    "description_id",
    "requirements_id",
  ] as const;
  const out: Partial<Record<(typeof keys)[number], string>> = {};
  for (const key of keys) {
    const value = optionalString(data[key]);
    if (value) out[key] = value;
  }
  return out;
}

function isUnknownArgumentError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientValidationError) {
    return /Unknown argument/i.test(error.message);
  }
  const msg = error instanceof Error ? error.message : String(error);
  return /Unknown argument/i.test(msg);
}

function baseCreateData(data: Record<string, unknown>) {
  const deadline = data.applicationDeadline
    ? new Date(data.applicationDeadline as string)
    : null;

  return {
    title: data.title as string,
    department: (data.department as string) || null,
    location: (data.location as string) || null,
    type: data.type
      ? jobTypeFromLabel(data.type as string)
      : jobTypeFromLabel((data.employmentType as string) ?? "Full-Time"),
    salaryRange: (data.salaryRange as string) || null,
    description: (data.description as string) || "",
    requirements: (data.requirements as string) || null,
    status: jobStatusFromValue((data.status as string) ?? "draft"),
    applicationDeadline:
      deadline && !isNaN(deadline.getTime()) ? deadline : null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const publicOnly = searchParams.get("public") === "true";

    const where: { status?: "DRAFT" | "ACTIVE" | "CLOSED" } = {};
    if (publicOnly) {
      where.status = "ACTIVE";
    } else if (status && status !== "All") {
      const statusMap: Record<string, "DRAFT" | "ACTIVE" | "CLOSED"> = {
        Draft: "DRAFT",
        Active: "ACTIVE",
        Closed: "CLOSED",
        DRAFT: "DRAFT",
        ACTIVE: "ACTIVE",
        CLOSED: "CLOSED",
      };
      const mapped = statusMap[status];
      if (mapped) where.status = mapped;
    }

    const jobs = await prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(
      jobs.map(({ _count, applicationDeadline, ...job }) => ({
        ...job,
        applicationDeadline: applicationDeadline?.toISOString() ?? null,
        applicants: _count.applications,
      }))
    );
  } catch (error: unknown) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json({ message: "Error fetching jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const createData = {
      ...baseCreateData(data),
      ...optionalIdFields(data),
    };

    let job;
    try {
      job = await prisma.jobPosting.create({
        data: createData,
        include: { _count: { select: { applications: true } } },
      });
    } catch (error: unknown) {
      if (!isUnknownArgumentError(error)) throw error;
      console.warn(
        "[api/jobs] Stale Prisma client rejected *_id fields; retrying without bilingual columns. Run: npx prisma generate, restart dev server, delete .next",
      );
      job = await prisma.jobPosting.create({
        data: baseCreateData(data),
        include: { _count: { select: { applications: true } } },
      });
    }

    return NextResponse.json({
      ...job,
      applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
      applicants: job._count.applications,
    });
  } catch (error: unknown) {
    console.error("Failed to create job:", error);
    return NextResponse.json({ message: "Error creating job" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, employmentType, applicants: _applicants, _count, ...rest } = data;
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const bilingual = jobPostingSupportsBilingualFields();
    const updateData: Record<string, unknown> = {};
    if (rest.title !== undefined) updateData.title = rest.title;
    if (bilingual && rest.title_id !== undefined)
      updateData.title_id = optionalString(rest.title_id);
    if (rest.department !== undefined) updateData.department = rest.department || null;
    if (bilingual && rest.department_id !== undefined)
      updateData.department_id = optionalString(rest.department_id);
    if (rest.location !== undefined) updateData.location = rest.location || null;
    if (bilingual && rest.location_id !== undefined)
      updateData.location_id = optionalString(rest.location_id);
    if (rest.salaryRange !== undefined) updateData.salaryRange = rest.salaryRange || null;
    if (bilingual && rest.salaryRange_id !== undefined)
      updateData.salaryRange_id = optionalString(rest.salaryRange_id);
    if (rest.description !== undefined) updateData.description = rest.description;
    if (bilingual && rest.description_id !== undefined)
      updateData.description_id = optionalString(rest.description_id);
    if (rest.requirements !== undefined) updateData.requirements = rest.requirements || null;
    if (bilingual && rest.requirements_id !== undefined)
      updateData.requirements_id = optionalString(rest.requirements_id);
    if (rest.type !== undefined) updateData.type = jobTypeFromLabel(rest.type);
    if (employmentType !== undefined) updateData.type = jobTypeFromLabel(employmentType);
    if (rest.status !== undefined) updateData.status = jobStatusFromValue(rest.status);
    if (rest.applicationDeadline !== undefined) {
      const deadline = rest.applicationDeadline ? new Date(rest.applicationDeadline) : null;
      updateData.applicationDeadline =
        deadline && !isNaN(deadline.getTime()) ? deadline : null;
    }

    let job;
    try {
      job = await prisma.jobPosting.update({
        where: { id },
        data: updateData,
        include: { _count: { select: { applications: true } } },
      });
    } catch (error: unknown) {
      if (!isUnknownArgumentError(error)) throw error;
      const {
        title_id: _t,
        department_id: _d,
        location_id: _l,
        salaryRange_id: _s,
        description_id: _desc,
        requirements_id: _r,
        ...legacy
      } = updateData;
      void _t;
      void _d;
      void _l;
      void _s;
      void _desc;
      void _r;
      job = await prisma.jobPosting.update({
        where: { id },
        data: legacy,
        include: { _count: { select: { applications: true } } },
      });
    }

    return NextResponse.json({
      ...job,
      applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
      applicants: job._count.applications,
    });
  } catch (error: unknown) {
    console.error("Failed to update job:", error);
    return NextResponse.json({ message: "Error updating job" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ message: "Job deleted" });
  } catch (error: unknown) {
    console.error("Failed to delete job:", error);
    return NextResponse.json({ message: "Error deleting job" }, { status: 500 });
  }
}
