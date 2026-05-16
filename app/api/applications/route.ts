import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as {
      jobPostingId?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      linkedinUrl?: string;
      coverLetter?: string;
      cvFileUrl?: string;
    };

    const fullName = String(data.fullName ?? "").trim();
    const email = String(data.email ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const cvFileUrl = String(data.cvFileUrl ?? "").trim();
    const jobPostingId = String(data.jobPostingId ?? "").trim();
    const linkedinUrl = String(data.linkedinUrl ?? "").trim() || null;
    const coverLetter = String(data.coverLetter ?? "").trim() || null;

    if (!fullName || !email || !phone || !cvFileUrl) {
      return NextResponse.json(
        { message: "Full name, email, phone, and CV are required" },
        { status: 400 },
      );
    }

    if (!jobPostingId) {
      return NextResponse.json({ message: "Job posting ID is required" }, { status: 400 });
    }

    const job = await prisma.jobPosting.findUnique({ where: { id: jobPostingId } });
    if (!job) {
      return NextResponse.json({ message: "Job posting not found" }, { status: 404 });
    }

    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This job is not accepting applications" },
        { status: 400 },
      );
    }

    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      if (!isNaN(deadline.getTime()) && new Date() > deadline) {
        return NextResponse.json(
          { message: "The application deadline for this job has passed" },
          { status: 400 },
        );
      }
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
