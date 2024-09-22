import { FC, HTMLAttributes, useState } from "react";

import { useTranslation } from "next-i18next";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { classNames } from "@/utils";
import map from "@/utils/map.json";

import { Typography } from "@msaaqcom/abjad";

interface CountryCardProps extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
  name: string;
  count: number;
  selected: boolean;
}

const ProgressBar = ({ value = 0 }) => {
  return (
    <div className="relative flex h-4 w-full items-center rounded-full bg-black/5 p-1">
      <div
        className={`h-2 max-w-full rounded-full bg-primary`}
        style={{ width: `${value}%` }}
      ></div>
      <span
        className={classNames("absolute left-1 text-[10px]", value >= 98 ? "text-white" : "text-gray-700")}
      >{`${value}%`}</span>
    </div>
  );
};

const CountryCard: FC<CountryCardProps> = ({ name, count, percentage, selected, ...props }) => {
  if (selected) {
    const element = document.querySelector(`#${name}`);
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }
  return (
    <div
      className={classNames("flex w-full flex-col rounded-xl p-4 hover:bg-gray-200", selected ? "bg-gray-200" : "")}
      id={name}
      tabIndex={0}
      {...props}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <Typography.Paragraph
          className="text-gray-950"
          children={name}
          weight="medium"
          size="md"
        />
        <Typography.Paragraph
          className="text-gray-950"
          children={count}
          weight="medium"
          size="md"
        />
      </div>
      <ProgressBar value={percentage ?? 0} />
    </div>
  );
};
const MapChart = ({ data = [] }: { data: any }) => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  return (
    <div className="flex gap-8">
      <div className="h-full max-h-[600px] w-[30%] overflow-y-scroll scroll-smooth">
        <div className="flex flex-col gap-2">
          {Object.keys(data).map((key) => (
            <CountryCard
              selected={selectedCountry == key}
              key={key}
              onMouseEnter={() => {
                setSelectedCountry(key);
              }}
              onMouseLeave={() => {
                setSelectedCountry(null);
              }}
              name={key == "" ? t("analytics.customers.other") : key}
              count={data[key].members_count}
              percentage={data[key].percentage}
            />
          ))}
        </div>
      </div>
      <div
        className="w-[70%]"
        data-tip=""
      >
        <ComposableMap>
          <Geographies geography={map}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    setSelectedCountry(geo.id);
                  }}
                  onMouseLeave={() => {
                    setSelectedCountry(null);
                  }}
                  style={{
                    default: {
                      fill: selectedCountry == geo.id ? "#43766D" : "#D6D6DA",
                      outline: "none"
                    },
                    hover: {
                      fill: "#43766D",
                      outline: "none"
                    },
                    pressed: {
                      fill: "#3B6961",
                      outline: "none"
                    }
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
};

export default MapChart;
