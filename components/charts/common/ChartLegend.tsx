import { classNames } from "@/utils";

import { Typography } from "@msaaqcom/abjad";

export interface LegendItemProps {
  name: string;
  color: string;
}

const LegendItem = ({ name, color }: LegendItemProps) => (
  <li className="ml-2.5 inline-flex items-center truncate">
    <svg
      className={classNames("ml-1.5 h-2 w-2 flex-none")}
      fill={color}
      viewBox="0 0 8 8"
    >
      <circle
        cx={4}
        cy={4}
        r={4}
      />
    </svg>
    <Typography.Paragraph
      as="span"
      weight="medium"
      size="md"
    >
      {name}
    </Typography.Paragraph>
  </li>
);

export interface LegendProps {
  categories: string[];
  colors?: string[];
}

const Legend = ({ categories, colors = ["blue"] }: LegendProps) => {
  return (
    <div>
      <ol className="list-element flex flex-wrap overflow-hidden truncate">
        {categories.map((category, idx) => (
          <LegendItem
            key={`item-${idx}`}
            name={category}
            color={colors[idx]}
          />
        ))}
      </ol>
    </div>
  );
};

const ChartLegend = ({ payload }: any, categoryColors: Map<string, string>) => {
  return (
    <div className="flex items-center justify-start">
      <Legend
        categories={payload.map((entry: any) => entry.value)}
        colors={payload.map((entry: any) => categoryColors.get(entry.value))}
      />
    </div>
  );
};

export default ChartLegend;
