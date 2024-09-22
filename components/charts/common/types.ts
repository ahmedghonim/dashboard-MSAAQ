import { baseColorValues } from "./colors";

export type Color = typeof baseColorValues[number];
export type ValueFormatter = {
  (value: number): string;
};
