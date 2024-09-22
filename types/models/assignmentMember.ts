import { Assignment, Course, FileType, Member } from "@/types";

export enum AssignmentMemberStatus {
  PROCESSING = "processing",

  ACCEPTED = "accepted",

  REJECTED = "rejected"
}

export type AssignmentMember = {
  id: number;
  title: string;
  content: string;
  file: FileType;
  status: AssignmentMemberStatus;
  member: Member;
  assignment: Assignment;
  attachment: string;
  course: Course | null;
  activities: {
    id: number;
    causer: Member;
    created_at: string;
    updated_at: string;
    message: string;
    notes: string | null;
    status: AssignmentMemberStatus;
  }[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};
