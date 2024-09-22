import { Color } from "./types";

export const baseColorValues = [
  "primary",
  "secondary",
  "info",
  "success",
  "purple",
  "orange",
  "cyan",
  "teal",
  "magenta"
] as const;

export const BaseColors: { [key: string]: Color } = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  info: "info",
  orange: "orange",
  purple: "purple",
  cyan: "cyan",
  teal: "teal",
  magenta: "magenta"
};

export const themeColorRange: Color[] = [
  BaseColors.purple,
  BaseColors.cyan,
  BaseColors.teal,
  BaseColors.magenta,
  BaseColors.primary,
  BaseColors.secondary,
  BaseColors.success,
  BaseColors.info,
  BaseColors.orange
];

export const hexColors: { [color: string]: string } = {
  [BaseColors.primary]: "#43766D",
  [BaseColors.secondary]: "#F0B110",
  [BaseColors.success]: "#36A471",
  [BaseColors.info]: "#3283ED",
  [BaseColors.orange]: "#ED702D",
  [BaseColors.purple]: "#612DBD",
  [BaseColors.cyan]: "#012749",
  [BaseColors.teal]: "#009D9A",
  [BaseColors.magenta]: "#EE538B"
};
