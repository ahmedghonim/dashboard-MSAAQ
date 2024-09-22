export type Step = {
  id: number;
  title: string;
  subtitle: string;
  action_text: string;
  action_url: string;
  is_read: boolean;
  image: any;
};

export type OnboardingData = {
  id: string;
  action_text: string;
  action_url: string;
  title: string;
  steps: Step[];
};

export type CheckListVideo = {
  button_text: string;
  description: string;
  title: string;
  url: string;
};

export type CheckListTask = {
  id: number;
  action: any;
  completion_message: string;
  description: string;
  estimated_time: number;
  event_id: number | string;
  icon: any;
  is_completed: boolean;
  steps_header: string;
  subtitle: string;
  title: string;
  video: CheckListVideo;
  steps: Array<{
    content: string;
    hint: string;
  }>;
};
export type CheckListBlock = {
  id: number;
  title: string;
  description: string;
  display_type: "list" | "stack";
  tasks: Array<CheckListTask>;
};
export type Checklist = {
  id: number;
  description: string;
  label: string;
  title: string;
  video: CheckListVideo;
  blocks: Array<CheckListBlock>;
};
