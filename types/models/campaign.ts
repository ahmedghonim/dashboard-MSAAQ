import { Course, Product, Segment } from "..";

export enum GoalType {
  LAUNCH_PRODUCT = "launch_product",
  DISCOUNT_ON_PRODUCT = "discount_on_product",
  UPDATE_PRODUCT = "update_product",
  CUSTOM_MESSAGE = "custom_message"
}

export enum CampaignStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  UNPUBLISHED = "unpublished"
}

export type Campaign = {
  id: number;
  uuid: string;
  name: string;
  goal: string;
  product: Product | Course;
  status: CampaignStatus;
  scheduled_at: string;
  sent_at: string;
  message_subject: string;
  message_body: string;
  recipient_count: number;
  segments: Segment[];
  product_type: string;

  newsletter_subscribed_count: number;
  newsletter_unsubscribed_count: number;
  open_rate: number;
  failed_count: number;
  unsubscribe_rate: number;
  click_rate: number;
  rate: number;
  bounce_rate: number;
};
