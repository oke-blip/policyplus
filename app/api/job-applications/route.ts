import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveApplicationCv } from "@/lib/save-application-cv";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get("jobPostingId");

    const applications = await prisma.jobApplication.findMany({
      where: jobPostingId ? { jobPostingId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        jobPosting: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(applications);
  } catch (error: unknown) {
    console.error("Failed to fetch job applications:", error);
    return NextResponse.json({ message: "Error fetching applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim() || null;
    const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim() || null;
    const coverLetter = String(formData.get("coverLetter") ?? formData.get("message") ?? "").trim() || null;
    const jobPostingId = String(formData.get("jobPostingId") ?? "").trim() || null;
    const cvFile = formData.get("cv") ?? formData.get("cvFile");

    if (!fullName || !email) {
      return NextResponse.json({ message: "Full name and email are required" }, { status: 400 });
    }

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      return NextResponse.json({ message: "CV file is required" }, { status: 400 });
    }

    if (jobPostingId) {
      const job = await prisma.jobPosting.findUnique({ where: { id: jobPostingId } });
      if (!job) {
        return NextResponse.json({ message: "Job posting not found" }, { status: 404 });
      }
      if (job.status !== "ACTIVE") {
        return NextResponse.json({ message: "This job is not accepting applications" }, { status: 400 });
      }
    }

    let cvFileUrl: string;
    try {
      cvFileUrl = await saveApplicationCv(cvFile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid CV file";
      return NextResponse.json({ message }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobPostingId,
        fullName,
        email,
        phone,
        linkedinUrl,
        coverLetter,
        cvFileUrl,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to submit application:", error);
    return NextResponse.json({ message: "Error submitting application" }, { status: 500 });
  }
}
