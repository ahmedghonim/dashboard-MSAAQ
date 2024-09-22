import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReChartsLineChart,
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

const LineChart = ({
  data = [],
  categories = [],
  dataKey,
  xAxisDataKey,
  colors = ["orange"],
  valueFormatter = defaultValueFormatter,
  startEndOnly = false,
  showXAxis = true,
  showYAxis = true,
  showAnimation = true,
  showTooltip = true,
  showLegend = true,
  showGridLines = true,
  autoMinValue = false,
  minValue,
  dir = "rtl",
  maxValue,
  hasDarkTooltips = true
}: BaseChartProps) => {
  const categoryColors = constructCategoryColors(categories, colors);

  const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue);

  return (
    <div
      className="h-80 w-full"
      dir={dir}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ReChartsLineChart data={data}>
          {showGridLines ? (
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
          ) : null}
          <XAxis
            hide={!showXAxis}
            dataKey={xAxisDataKey ?? dataKey}
            interval={"preserveStartEnd"}
            tick={{ transform: "translate(0, 6)" }}
            ticks={startEndOnly ? [data[0][dataKey], data[data.length - 1][dataKey]] : undefined}
            style={{
              fontFamily: "'IBM Plex Sans Arabic'",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "21px",
              color: "#8A8A8A"
            }}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
            minTickGap={5}
          />

          <YAxis
            width={56}
            hide={!showYAxis}
            axisLine={false}
            tickLine={false}
            type="number"
            orientation="right"
            domain={yAxisDomain as AxisDomain}
            tick={{ transform: "translate(48, 0)" }}
            style={{
              fontFamily: "'IBM Plex Sans Arabic'",
              fontStyle: "normal",
              fontSize: "14px",
              lineHeight: "21px"
            }}
            tickFormatter={valueFormatter}
          />
          {showTooltip ? (
            <Tooltip
              // ongoing issue: https://github.com/recharts/recharts/issues/2920
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={false}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                let $label = label;
                if (payload && xAxisDataKey) {
                  $label = payload[0]?.payload.date;
                }
                return (
                  <ChartTooltip
                    active={active}
                    payload={payload}
                    label={$label}
                    valueFormatter={valueFormatter}
                    categoryColors={categoryColors}
                    isDark={hasDarkTooltips}
                  />
                );
              }}
              position={{ y: 0 }}
            />
          ) : null}
          {showLegend ? (
            <Legend
              verticalAlign="top"
              height={60}
              content={({ payload }) => ChartLegend({ payload }, categoryColors)}
            />
          ) : null}
          {categories.map((category) => (
            <Line
              key={category}
              name={category}
              type="linear"
              dataKey={category}
              stroke={categoryColors.get(category)}
              strokeWidth={2}
              dot={false}
              isAnimationActive={showAnimation}
            />
          ))}
        </ReChartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
