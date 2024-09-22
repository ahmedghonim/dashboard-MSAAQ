import React, { useState } from "react";

import { Pie, PieChart as ReChartsDonutChart, ResponsiveContainer, Tooltip } from "recharts";

import { BaseColors, hexColors, themeColorRange } from "@/components/charts/common/colors";
import { Color, ValueFormatter } from "@/components/charts/common/types";
import { defaultValueFormatter } from "@/components/charts/common/utils";
import { handleMouseEnter, handleMouseLeave } from "@/components/charts/helpers/hoverLeaveHandler";
import { useFormatPrice } from "@/hooks";
import { classNames } from "@/utils";

import { Grid, Typography } from "@msaaqcom/abjad";

import { DonutChartTooltip } from "./DonutChartTooltip";
import { parseData, parseLabelInput } from "./inputParser";

type DonutChartVariant = "donut" | "pie";

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  category?: string;
  dataKey?: string;
  colors?: Color[];
  variant?: DonutChartVariant;
  valueFormatter?: ValueFormatter;
  label?: string;
  showLabel?: boolean;
  showAnimation?: boolean;
  showTooltip?: boolean;
  chartText: string;
  hasDarkTooltips?: boolean;
  valueSuffix?: string;
  tooltipMinWidth?: number;
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>((props, ref) => {
  const {
    data = [],
    category = "value",
    dataKey = "name",
    colors = themeColorRange,
    variant = "donut",
    valueFormatter = defaultValueFormatter,
    label,
    showLabel = true,
    showAnimation = true,
    showTooltip = true,
    className,
    chartText,
    tooltipMinWidth,
    hasDarkTooltips = true,
    valueSuffix = "",
    ...other
  } = props;
  const isDonut = variant == "donut";
  const parsedLabelInput = parseLabelInput(label, valueFormatter, data, category);
  const [newDonutChartData, setNewDonutChartData] = useState<any[]>([]);
  const [sectionActive, setSectionActive] = useState<boolean>(false);
  const [legendIndex, setLegendIndex] = useState<number | null>(null);

  const { formatRawPriceWithoutCurrency } = useFormatPrice();

  return (
    <>
      <Grid
        columns={{
          sm: 1,
          md: 3,
          xl: 3
        }}
        className="items-center"
      >
        <Grid.Cell>
          <div
            ref={ref}
            className={classNames("h-48 w-auto lg:min-w-[7rem] xl:w-auto", className)}
            {...other}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ReChartsDonutChart>
                {showLabel && isDonut ? (
                  <>
                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={"#000"}
                      fontWeight="bold"
                      fontSize={16}
                    >
                      {parsedLabelInput}
                    </text>
                    <text
                      x="50%"
                      y="57%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={"#8A8A8A"}
                      fontSize={10}
                    >
                      {chartText}
                    </text>
                  </>
                ) : null}
                <Pie
                  data={parseData(newDonutChartData.length > 0 ? newDonutChartData : data, colors)}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={isDonut ? "80%" : "0%"}
                  outerRadius="100%"
                  paddingAngle={0}
                  dataKey={category}
                  nameKey={dataKey}
                  isAnimationActive={!sectionActive ? showAnimation : false}
                  stroke="none"
                  onMouseOver={(_, index) =>
                    handleMouseEnter(data, index, setNewDonutChartData, setSectionActive, setLegendIndex)
                  }
                  onMouseLeave={() => handleMouseLeave(data, setNewDonutChartData, setLegendIndex)}
                />
                {showTooltip ? (
                  <Tooltip
                    wrapperStyle={{ outline: "none", ...(tooltipMinWidth && { minWidth: `${tooltipMinWidth}px` }) }}
                    allowEscapeViewBox={{ x: true }}
                    reverseDirection={{ x: true }}
                    content={({ active, payload }) => (
                      <>
                        <DonutChartTooltip
                          active={active}
                          payload={payload}
                          isDark={hasDarkTooltips}
                          valueFormatter={valueFormatter}
                          valueSuffix={valueSuffix}
                        />
                      </>
                    )}
                  />
                ) : null}
              </ReChartsDonutChart>
            </ResponsiveContainer>
          </div>
        </Grid.Cell>
        <Grid.Cell
          columnSpan={{
            sm: 1,
            md: 2,
            xl: 2
          }}
        >
          {data.map((datum, i) => (
            <div
              key={i}
              className={classNames(
                "mb-1 ml-5 flex items-center justify-between opacity-100",
                legendIndex !== i && legendIndex !== null && "!opacity-50"
              )}
            >
              <div className="flex items-center">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: hexColors[BaseColors[colors[i] ?? BaseColors.primary]]
                  }}
                ></span>
                <Typography.Paragraph
                  size="lg"
                  children={datum[dataKey] ?? "-"}
                  className="mr-2 w-32 overflow-hidden text-ellipsis whitespace-nowrap xl:w-60 print:w-full"
                />
              </div>
              <Typography.Paragraph
                size="lg"
                children={formatRawPriceWithoutCurrency(datum[category] ?? 0)}
                className="mr-2"
              />
            </div>
          ))}
        </Grid.Cell>
      </Grid>
    </>
  );
});

export default DonutChart;
