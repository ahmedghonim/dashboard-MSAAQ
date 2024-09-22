import React, { forwardRef, useMemo } from "react";

import { components } from "react-select";

import { SelectProps } from "@/components/select/Select";
import { Select } from "@/components/select/index";
import { useAppSelector } from "@/hooks";
import { AppSliceStateType } from "@/store/slices/app-slice";

const CountriesSelect = forwardRef<any, SelectProps>(({ ...props }, ref) => {
  const { countries } = useAppSelector<AppSliceStateType>((state) => state.app);

  const mappedCountries = useMemo(
    () =>
      countries.map((country) => ({
        label: country.ar_name,
        value: country.iso_3166_1_alpha2
      })),
    [countries]
  );

  return (
    <Select
      ref={ref}
      options={mappedCountries}
      components={{
        Option: (props) => (
          <components.Option {...props}>
            <div className="flex items-center">
              <div
                style={{
                  backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props.data.value?.toLowerCase()}.svg)`
                }}
                className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
              />
              <span className="mr-2">{props.data.label}</span>
            </div>
          </components.Option>
        ),
        SingleValue: (props) => (
          <components.SingleValue {...props}>
            <div className="flex items-center">
              <div
                style={{
                  backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props.data.value?.toLowerCase()}.svg)`
                }}
                className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
              />
              <span className="mr-2">{props.data.label}</span>
            </div>
          </components.SingleValue>
        )
      }}
      {...props}
    />
  );
});

export default CountriesSelect;
