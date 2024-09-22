export type FieldForm = {
  name: string;
  type: "email" | "text" | "number" | "phone" | "select";
  label?: string;
  placeholder: string;
  required: boolean;
  status: boolean;
  options?: {
    label: string;
    value: string;
  }[];
};

export type IForm = {
  id: string;
  title: string;
  type: string;
  fields: FieldForm[];
};
