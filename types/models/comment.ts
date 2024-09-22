import { Article, Content, Course, Member, Product, User } from "@/types";

export enum CommentStatus {
  SHOWN = "shown",
  HIDDEN = "hidden"
}

export type Comment = {
  id: number;
  content: string;
  parent_id: null | number;
  is_admin: boolean;
  member: Member | User;
  replies_count?: number;
  replies: Array<Comment>;
  path: string;
  title: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
  status: CommentStatus;
  commentable_type: "course" | "product" | "content" | "article";
  commentable: Course | Product | Article | Content<any>;
  children: Array<Comment>;
};
