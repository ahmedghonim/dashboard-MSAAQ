import { Color, ValueFormatter } from "@/components/charts/common/types";

interface BaseChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  categories?: string[];
  dataKey: string;
  colors?: Color[];
  valueFormatter?: ValueFormatter;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  showAnimation?: boolean;
  showTooltip?: boolean;
  showGradient?: boolean;
  showLegend?: boolean;
  showGridLines?: boolean;
  autoMinValue?: boolean;
  minValue?: number;
  maxValue?: number;
  radius?: number;
  hasDarkTooltips?: boolean;
  xAxisDataKey?: string;
}

export default BaseChartProps;
