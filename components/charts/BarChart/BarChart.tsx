import React from "react";

import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as ReChartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";

import BaseChartProps from "@/components/charts/common/BaseChartProps";
import ChartLegend from "@/components/charts/common/ChartLegend";
import ChartTooltip from "@/components/charts/common/ChartTooltip";
import { constructCategoryColors, defaultValueFormatter, getYAxisDomain } from "@/components/charts/common/utils";
import { classNames } from "@/utils";

export interface BarChartProps extends BaseChartProps {
  layout?: "vertical" | "horizontal";
  stack?: boolean;
  relative?: boolean;
}
const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>((props, ref) => {
  const {
    data = [],
    categories = [],
    dataKey,
    colors = ["purple"],
    valueFormatter = defaultValueFormatter,
    layout = "horizontal",
    stack = false,
    relative = false,
    startEndOnly = false,
    showAnimation = true,
    showXAxis = true,
    showYAxis = true,
    yAxisWidth = 45,
    showTooltip = true,
    showLegend = true,
    showGridLines = true,
    autoMinValue = false,
    minValue,
    maxValue,
    radius = 0,
    className,
    hasDarkTooltips = true,
    ...other
  } = props;

  const categoryColors = constructCategoryColors(categories, colors);

  const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue);

  return (
    <div
      ref={ref}
      className={classNames("mt-8 h-48", className)}
      {...other}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ReChartsBarChart
          data={data}
          stackOffset={relative ? "expand" : "none"}
          layout={layout === "vertical" ? "vertical" : "horizontal"}
        >
          {showGridLines ? (
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={layout !== "vertical" ? true : false}
              vertical={layout !== "vertical" ? false : true}
            />
          ) : null}

          {layout !== "vertical" ? (
            <XAxis
              hide={!showXAxis}
              dataKey={dataKey}
              interval="preserveStartEnd"
              tick={{ transform: "translate(0, 6)" }} //padding between labels and axis
              ticks={startEndOnly ? [data[0][dataKey], data[data.length - 1][dataKey]] : undefined}
              style={{
                fontSize: "12px",
                fontFamily: "Inter; Helvetica",
                marginTop: "20px"
              }}
              tickLine={false}
              axisLine={false}
            />
          ) : (
            <XAxis
              hide={!showXAxis}
              type="number"
              tick={{ transform: "translate(-3, 0)" }}
              domain={yAxisDomain as AxisDomain}
              style={{
                fontSize: "12px",
                fontFamily: "Inter; Helvetica"
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
              padding={{ left: 10, right: 10 }}
              minTickGap={5}
            />
          )}

          {layout !== "vertical" ? (
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              type="number"
              domain={yAxisDomain as AxisDomain}
              tick={{ transform: "translate(25, 0)" }}
              orientation="right"
              style={{
                fontSize: "12px",
                fontFamily: "Inter; Helvetica"
              }}
              tickFormatter={valueFormatter}
            />
          ) : (
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              dataKey={dataKey}
              axisLine={false}
              tickLine={false}
              ticks={startEndOnly ? [data[0][dataKey], data[data.length - 1][dataKey]] : undefined}
              type="category"
              interval="preserveStartEnd"
              tick={{ transform: "translate(0, 6)" }}
              style={{
                fontSize: "12px",
                fontFamily: "Inter; Helvetica"
              }}
            />
          )}
          {showTooltip ? (
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={false}
              cursor={{ fill: "#d1d5db", opacity: "0.15" }}
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={valueFormatter}
                  categoryColors={categoryColors}
                  isDark={hasDarkTooltips}
                />
              )}
              position={{ y: 0 }}
            />
          ) : null}
          {showLegend ? (
            <Legend
              verticalAlign="top"
              height={40}
              content={({ payload }) => ChartLegend({ payload }, categoryColors)}
            />
          ) : null}
          {categories.map((category) => (
            <Bar
              key={category}
              name={category}
              type="linear"
              barSize={25}
              radius={radius}
              label={false}
              stackId={stack || relative ? "a" : undefined}
              dataKey={category}
              fill={categoryColors.get(category)}
              isAnimationActive={showAnimation}
            />
          ))}
        </ReChartsBarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default BarChart;
