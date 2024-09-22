import { PaginationLink } from "@/types";

export type Filter = {
  name: string;
  type: string;
  label: string;
  select_type: string;
  options: Array<any>;
  hasOptions: boolean;
};

type Errors = {
  [key: string]: string[];
};

export enum ErrorCodes {
  ADDON_USAGE_EXCEEDED = "ADDON_USAGE_EXCEEDED",
  ADDON_NOT_AVAILABLE = "ADDON_NOT_AVAILABLE",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED"
}

export type APIActionResponse<T> = {
  avatar(avatar: any, avatar1: any): unknown;
  data: {
    data: T;
    message?: {
      body: string;
      title?: string;
    };
  };
  error?: {
    status: number;
    message: string;
    title: string;
    code?: ErrorCodes;
    errors: Errors;
  };
};

export type APIResponse<T> = {
  data: Array<T>;
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: Array<PaginationLink>;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
    sortable: Array<string>;
    filters: Array<Filter>;
    relationships: Array<string>;
  };
};

export type APISingleResourceResponse<T> = {
  data: T;
};
