import type { JobApplicationStatus, JobPostingStatus, JobType } from "@/app/generated/prisma";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const JOB_STATUS_LABELS: Record<JobPostingStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export function jobTypeFromLabel(label: string): JobType {
  const map: Record<string, JobType> = {
    "Full-Time": "FULL_TIME",
    "Part-Time": "PART_TIME",
    Contract: "CONTRACT",
    Internship: "INTERNSHIP",
  };
  return map[label] ?? "FULL_TIME";
}

export function jobTypeToLabel(type: JobType): string {
  return JOB_TYPE_LABELS[type] ?? "Full-Time";
}

export function jobStatusFromValue(value: string): JobPostingStatus {
  const map: Record<string, JobPostingStatus> = {
    draft: "DRAFT",
    active: "ACTIVE",
    closed: "CLOSED",
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
  };
  return map[value] ?? "DRAFT";
}

export function jobStatusToLabel(status: JobPostingStatus): string {
  return JOB_STATUS_LABELS[status] ?? "Draft";
}

export function jobStatusToFormValue(status: JobPostingStatus): string {
  return status.toLowerCase();
}

export const JOB_APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export function jobApplicationStatusToLabel(status: JobApplicationStatus): string {
  return JOB_APPLICATION_STATUS_LABELS[status] ?? status;
}
