import { Chapter } from "@/types";

export type Content<T = {}> = {
  id: number;
  course_id?: number;
  title: string;
  summary: string;
  meta: T;
  type: string;
  sort: number;
  icon: string;
  url: string | null;
  premium: boolean;
  options: {
    discussions_enabled: boolean;
  };
  updated_at: string;
  created_at: string;
  chapter: Chapter | null;
};
