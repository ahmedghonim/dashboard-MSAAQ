export type Announcement = {
  id: string;
  action_text: string;
  action_url: string;
  month: string;
  subtitle: string;
  title: string;
  trigger_value: string;
  trigger_type: "end_with" | "start_with" | "all_pages";
  steps: {
    action_text: string;
    action_url: string;
    subtitle: string;
    title: string;
    image: any;
    created_at: string;
    item_selector: string;
    before_change_action_payload: any;
    before_change_action: string;
    waiting_events_before_change: string;
  }[];
  type: "tour" | "in_app";
  size: "large" | "small";
  badge: string;
};
