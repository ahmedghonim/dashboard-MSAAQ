import { Chapter, Content, Course, Question } from "@/types";

export type Quiz = {
  id: number | string;
  title: string;
  type: "quiz" | "question_bank" | "survey";
  passing_score: number;
  questions_count: number;
  results_count: number;
  duration: number;
  show_results_at_end: boolean;
  randomised: boolean;
  questions: Array<Question>;
  course: Course | null;
  chapter: Chapter | null;
  content: Content | null;
  allow_question_navigation: boolean;
  show_results: boolean;
  edit_url: string;
  created_at: string;
  total_questions_count: number;
  question_banks?: Array<QuestionBank>;
  summary: string;
};

export type QuestionBank = {
  title?: string;
  id?: number;
  question_bank_id: number | string;
  questions_count: number;
  select_all: boolean;
  total_questions_count: number;
};
