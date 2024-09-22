import { Member, Quiz } from "@/types";

export type SurveyMember = {
  id: number | string;
  answers: Array<{
    id: number;
    question_id: number;
    content: string;
  }>;
  member: Member;
  completed_at: string;
};
