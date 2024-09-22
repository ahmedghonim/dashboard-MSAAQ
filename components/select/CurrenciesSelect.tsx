import React, { forwardRef, useMemo } from "react";

import Image from "next/image";

import { components } from "react-select";

import { SelectProps } from "@/components/select/Select";
import { Select } from "@/components/select/index";
import { useAppSelector } from "@/hooks";
import { AppSliceStateType } from "@/store/slices/app-slice";

import { Typography } from "@msaaqcom/abjad";

export const CountryNameWithFlag = ({ country, label, symbol }: any) => (
  <div className="flex items-center gap-2">
    <Image
      width={26}
      height={16}
      className="pointer-events-none select-none rounded"
      src={`https://cdn.msaaq.com/assets/flags/${country?.toLowerCase()}.svg`}
      alt={label}
    />

    <Typography.Paragraph
      weight="medium"
      children={
        <>
          {label} <span dangerouslySetInnerHTML={{ __html: `(${symbol})` }} />
        </>
      }
    />
  </div>
);

const CurrenciesSelect = forwardRef<any, SelectProps>(({ ...props }, ref) => {
  const { currencies } = useAppSelector<AppSliceStateType>((state) => state.app);

  const mappedCurrencies = useMemo(
    () =>
      currencies.map((currency) => ({
        label: currency.name,
        value: currency.code,
        ...currency
      })),
    [currencies]
  );

  return (
    <Select
      ref={ref}
      options={mappedCurrencies}
      components={{
        Option: (props) => (
          <components.Option {...props}>
            <CountryNameWithFlag
              label={props.data.label}
              symbol={props.data.symbol}
              country={props.data.country_code}
            />
          </components.Option>
        ),
        SingleValue: (props) => (
          <components.SingleValue {...props}>
            <CountryNameWithFlag
              label={props.data.label}
              symbol={props.data.symbol}
              country={props.data.country_code}
            />
          </components.SingleValue>
        )
      }}
      {...props}
    />
  );
});

export default CurrenciesSelect;
