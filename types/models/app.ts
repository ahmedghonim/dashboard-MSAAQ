export type Field = {
  fields?: any;
  items?: {
    [key: string]: any;
  }[];
  based_on?: string[];
  ajax?: {
    url: string;
    method: string;
    schema: {
      label: string;
      value: string;
    };
    mapping_key: string;
    source: "internal" | "external";
  };
  name: string;
  type: "text" | "textarea" | "checkbox" | "select";
  label: string;
  help: string;
  readonly: boolean;
  required: boolean;
  placeholder: string;
  value: null | any;
  copiable?: boolean;
  validation: {
    [key: string]: any;
  };
  tooltip: string;
};
export type App = {
  //only payment gateway apps
  with_msaaqpay?: boolean;
  id: number;
  title: string;
  slug: string;
  description: string;
  help_url: string;
  installed: boolean;
  old_installed: boolean;
  fields: Array<Field> | null;
  install_way: string;
  install_url: string;
  install_instructions: Array<string> | null;
  category: "payment" | string;
  badge: string;
  icon: {
    id: number;
    name: string;
    url: string;
    size: number;
    mime: string;
  };
  favicon: string;
  notes: string;
  created_at: string;
  updated_at: string;
};
