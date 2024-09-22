import React, { FC } from "react";

import { calculateSalesPercentage, classNames } from "@/utils";

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

import { Icon, Typography } from "@msaaqcom/abjad";

interface RateOfChangeArrowProps {
  current: number;
  previous: number;
}

const RateOfChangeArrow: FC<RateOfChangeArrowProps> = ({ current, previous }) => {
  const percentage = calculateSalesPercentage(current, previous);
  return percentage ? (
    <div className={classNames("flex items-center", percentage > 0 ? "text-success" : "text-danger")}>
      <Icon>{percentage > 0 ? <ArrowTrendingUpIcon /> : <ArrowTrendingDownIcon />}</Icon>
      <Typography.Paragraph
        size="md"
        weight="medium"
      >
        {percentage.toFixed(2)}%
      </Typography.Paragraph>
    </div>
  ) : null;
};

export default RateOfChangeArrow;
