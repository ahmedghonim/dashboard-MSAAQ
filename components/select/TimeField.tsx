import { forwardRef, useEffect } from "react";

import { ConfigType } from "dayjs";
import { GroupBase } from "react-select";

import { SelectProps } from "@/components/select/Select";
import { Select } from "@/components/select/index";
import dayjs from "@/lib/dayjs";
import { useOptions } from "@/utils";

import { Form } from "@msaaqcom/abjad";

interface IProps extends SelectProps {
  onChange: (value: { from: string | null; to: string | null }) => void;
}

interface IOption {
  label: string;
  value: number;
}

const LazySelect = ({
  value,
  min,
  max,
  ...props
}: Omit<SelectProps<IOption, false, GroupBase<IOption>>, "value"> & {
  value: ConfigType;
  min?: ConfigType;
  max?: ConfigType;
}) => {
  const { options, filter } = useOptions();

  useEffect(() => {
    filter({ current: value });
  }, [filter, value]);

  return (
    <Select
      options={options}
      onMenuOpen={() => {
        if (min) filter({ offset: min });
        if (max) filter({ limit: max });
      }}
      value={options.find((option) => option.value === dayjs(value).toDate().valueOf())}
      onMenuClose={() => filter({ current: value })}
      components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
      {...props}
    />
  );
};

const TimeField = forwardRef<any, IProps>(({ onChange, ...props }, ref) => {
  return (
    <div
      className="flex items-center gap-3"
      ref={ref}
    >
      <Form.Group className="mb-0 w-full max-w-[100px]">
        <LazySelect
          value={props?.value?.from}
          max={props?.value?.to}
          onChange={(option) => {
            onChange({ ...props?.value, from: option?.value });
          }}
        />
      </Form.Group>
      <span>-</span>
      <Form.Group className="mb-0 w-full max-w-[100px]">
        <LazySelect
          value={props?.value?.to}
          min={props?.value?.from}
          onChange={(option) => {
            onChange({ ...props?.value, to: option?.value });
          }}
        />
      </Form.Group>
    </div>
  );
});

export default TimeField;
