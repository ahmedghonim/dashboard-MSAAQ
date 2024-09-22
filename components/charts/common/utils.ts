import { Color, ValueFormatter } from "@/components/charts/common/types";

import { BaseColors, hexColors } from "./colors";

export const defaultValueFormatter: ValueFormatter = (value: number) => value.toString();

export const constructCategoryColors = (
  categories: string[],
  colors: Color[] | string[]
): Map<string, Color | string> => {
  const categoryColors = new Map<string, Color | string>();

  categories.forEach((category, idx) => {
    categoryColors.set(category, hexColors[BaseColors[colors[idx]]]);
  });
  return categoryColors;
};

export const getYAxisDomain = (autoMinValue: boolean, minValue: number | undefined, maxValue: number | undefined) => {
  const minDomain = autoMinValue ? "auto" : minValue ?? 0;
  const maxDomain = maxValue ?? "auto";
  return [minDomain, maxDomain];
};

export const sumNumericArray = (arr: number[]) => arr.reduce((prefixSum, num) => prefixSum + num, 0);

export const resolveColor = (colors: any[], idx: number) => {
  return hexColors[BaseColors[colors[idx]]] || colors[idx] || hexColors[BaseColors.primary];
};
