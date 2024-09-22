import { Member, Quiz } from "@/types";

export type QuizMember = {
  id: number | string;
  quiz: Quiz;
  survey: Quiz;
  member: Member;
  completed_questions: number;
  correct_answers: number;
  percent_correct: number;
  passed: boolean;
  attempts: number;
  started_at: string;
  completed_at: string;
};
