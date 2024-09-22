export enum ProductModelType {
  PRODUCT = "product",
  COURSE = "course"
}

export const ACCESS_TOKEN: string = "access_token";
export const CURRENT_ACADEMY_ID: string = "current_academy";

export type FETCH_STATUSES = "loaded" | "loading" | "failed";
export const FETCH_STATUS_LOADED: FETCH_STATUSES = "loaded";
export const FETCH_STATUS_LOADING: FETCH_STATUSES = "loading";
export const FETCH_STATUS_FAILED: FETCH_STATUSES = "failed";

export const BREAKPOINTS = {
  xs: "(min-width:  480px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)"
};
