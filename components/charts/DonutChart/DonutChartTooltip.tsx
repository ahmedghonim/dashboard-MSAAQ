import { ChartTooltipFrame, ChartTooltipRow } from "@/components/charts/common/ChartTooltip";
import { ValueFormatter } from "@/components/charts/common/types";

export interface DonutChartTooltipProps {
  active: boolean | undefined;
  payload: any;
  valueFormatter: ValueFormatter;
  isDark?: boolean;
  valueSuffix?: string;
}

export const DonutChartTooltip = ({
  active,
  payload,
  valueFormatter,
  isDark = false,
  valueSuffix
}: DonutChartTooltipProps) => {
  if (active && payload[0]) {
    const payloadRow = payload[0];
    return (
      <ChartTooltipFrame isDark={isDark}>
        <div className="px-4 py-2">
          <ChartTooltipRow
            value={valueFormatter(payloadRow.value)}
            name={payloadRow.name}
            color={payloadRow.payload.color}
            isDark={isDark}
            valueSuffix={valueSuffix}
          />
        </div>
      </ChartTooltipFrame>
    );
  }
  return null;
};
