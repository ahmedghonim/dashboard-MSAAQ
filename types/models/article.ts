import { Taxonomy, User } from "@/types";

import { SingleFile } from "@msaaqcom/abjad";

export enum ArticleStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled"
}

export type Article = {
  id: number;
  title: string;
  created_by: User;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  content: string | null;
  thumbnail: any;
  url: string;
  taxonomies: Taxonomy[] | [];
  status: ArticleStatus;
  created_at: string;
  published_at: string;
  updated_at: string;
};
