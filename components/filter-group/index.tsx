import React from "react";

import { classNames } from "@/utils";

import { Button } from "@msaaqcom/abjad";

const FilterGroup = ({
  filters,
  current_value
}: {
  filters: Array<{
    key: string;
    title: string;
    actions: any;
  }>;
  current_value: string;
}) => {
  return (
    <div className="divide-x-gray flex w-fit items-center divide-x divide-x-reverse rounded-md border border-solid border-gray bg-gray-50 p-2">
      {filters.map((filter, index) => (
        <React.Fragment key={filter.key}>
          <Button
            variant="default"
            size="sm"
            ghost={current_value != filter.key}
            className={classNames(
              "min-w-[80px] px-2 py-1.5",
              current_value == filter.key ? "bg-black/[0.04] font-medium" : "font-normal"
            )}
            children={filter.title}
            {...filter.actions}
          />
          {index !== filters.length - 1 && <div className="mx-2 h-[22px] w-px bg-gray" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FilterGroup;
