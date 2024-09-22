import { Color, ValueFormatter } from "@/components/charts/common/types";
import { resolveColor, sumNumericArray } from "@/components/charts/common/utils";

export const parseData = (data: any[], colors: Color[]) =>
  data.map((dataPoint: any, idx: number) => {
    const baseColor = resolveColor(colors, idx);

    return {
      ...dataPoint,
      // explicitly adding color key if not present for tooltip coloring
      color: baseColor,
      fill: baseColor // Hex Code
    };
  });

const calculateDefaultLabel = (data: any[], category: string) =>
  sumNumericArray(data.map((dataPoint) => dataPoint[category]));

export const parseLabelInput = (
  labelInput: string | undefined,
  valueFormatter: ValueFormatter,
  data: any[],
  category: string
) => (labelInput ? labelInput : valueFormatter(calculateDefaultLabel(data, category)));
