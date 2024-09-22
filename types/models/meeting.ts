export type Meeting = {
  meeting_provider: string;
  meeting_type: string;
  meeting_status: "upcoming" | "ended" | "live";
  meeting_id: string;
  start_time: string;
  start_at: string;
  join_url: string;
  start_url: string;
  password: string;
  duration: number;
  timezone: string;
  is_recurring: boolean;
  recurrence: string;
  occurrence: {
    occurrence_id: string;
    start_time: string;
    duration: number;
    status: string;
    total: number;
    current: number;
  };
};
