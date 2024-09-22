import React, { ReactNode } from "react";

import { Color, ValueFormatter } from "@/components/charts/common/types";
import { classNames } from "@/utils";

import { Typography } from "@msaaqcom/abjad";

export const ChartTooltipFrame = ({
  children,
  isDark,
  className
}: {
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}) => (
  <div
    className={classNames(
      "rounded-md border text-sm shadow-lg",
      isDark && "border-none bg-gray-900 text-white",
      className
    )}
  >
    {children}
  </div>
);

export interface ChartTooltipRowProps {
  value: string;
  name: string;
  color: Color | string | undefined;
  chartTooltipClassName?: string;
  hasLegend?: boolean;
  isDark?: boolean;
  valueSuffix?: string;
}

export const ChartTooltipRow = ({
  value,
  name,
  color,
  chartTooltipClassName,
  hasLegend = true,
  isDark,
  valueSuffix
}: ChartTooltipRowProps) => (
  <div className={classNames("flex items-center justify-between gap-x-8", chartTooltipClassName)}>
    <Typography.Paragraph
      weight="medium"
      as="span"
    >
      {name ?? "-"}
    </Typography.Paragraph>
    <div className="flex items-center gap-x-2">
      <Typography.Paragraph
        weight="medium"
        as="span"
        className={classNames(isDark ? "text-gray-200" : "text-gray-700")}
      >
        <div className="flex gap-2">
          <span>{value}</span>
          <span>{valueSuffix}</span>
        </div>
      </Typography.Paragraph>
      {hasLegend && (
        <span
          className={classNames("shrink-0", "border-white", "h-3", "w-3", "rounded-full", "border-2", "shadow")}
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  </div>
);

export const ChartTooltipColumn = ({
  value,
  name,
  color,
  chartTooltipClassName,
  hasLegend = true
}: ChartTooltipRowProps) => (
  <div className={classNames("flex items-center justify-between gap-x-8", chartTooltipClassName)}>
    <Typography.Paragraph
      weight="normal"
      as="span"
    >
      {name}
    </Typography.Paragraph>
    <div className="flex items-center gap-x-2">
      {hasLegend && (
        <span
          className={classNames("shrink-0", "border-white", "h-3", "w-3", "rounded-full", "border-2", "shadow")}
          style={{ backgroundColor: color }}
        />
      )}
      <Typography.Paragraph
        as="span"
        size="lg"
      >
        {value}
      </Typography.Paragraph>
    </div>
  </div>
);

export interface ChartTooltipProps {
  active: boolean | undefined;
  payload: any;
  label: string;
  categoryColors: Map<string, Color | string>;
  valueFormatter: ValueFormatter;
  isDark?: boolean;
}

const ChartTooltip = ({ active, payload, label, categoryColors, valueFormatter, isDark }: ChartTooltipProps) => {
  if (active && payload) {
    return (
      <ChartTooltipFrame isDark={isDark}>
        <div className={classNames("border-b border-gray-200 px-4 py-2", isDark && "!border-gray-700")}>
          <Typography.Paragraph
            weight="medium"
            as="span"
            size="lg"
          >
            {label}
          </Typography.Paragraph>
        </div>

        <div className="space-y-1 px-4 py-2">
          {payload.map(({ value, name }: { value: number; name: Color }, idx: number) => (
            <ChartTooltipRow
              key={`id-${idx}`}
              value={valueFormatter(value)}
              name={name}
              color={categoryColors.get(name)}
              isDark={isDark}
            />
          ))}
        </div>
      </ChartTooltipFrame>
    );
  }
  return null;
};

export default ChartTooltip;
