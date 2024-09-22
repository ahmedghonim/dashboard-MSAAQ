import { FileType } from "@/types";

export type Assignment = {
  id: number;
  title: string;
  content: string;
  file: FileType;
  created_at: string;
  updated_at: string;
};
