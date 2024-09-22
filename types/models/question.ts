import { Choice, Quiz } from "@/types";

export type Question = {
  id: number;
  title: string;
  explanation: string;
  type: string | number;
  sort: number;
  choices: Array<Choice>;
  updated_at: string;
  created_at: string;
  answers_count: number;
  quiz: Quiz;
  answers: Array<{
    choice_id: number;
  }>;
};
