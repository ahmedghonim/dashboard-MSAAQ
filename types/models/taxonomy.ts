import { Course } from "@/types";

import { SingleFile } from "@msaaqcom/abjad";

export enum TaxonomyType {
  COURSE_CATEGORY = "course_category",
  COURSE_TAG = "course_tag",
  COURSE_DIFFICULTY = "course_difficulty",
  PRODUCT_CATEGORY = "product_category",
  PRODUCT_VARIANT = "product_variant",
  POST_CATEGORY = "post_category",
  POST_TAG = "post_tag"
}

export type Taxonomy = {
  items_count: number;
  id: number;
  name: string;
  url: string;
  description: string | null;
  icon: Object | any;
  slug: string;
  type: TaxonomyType;
  created_at: string;
  courses: Course[];
};
