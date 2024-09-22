import React, { forwardRef } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { components } from "react-select";

import { SelectProps } from "@/components/select/Select";
import { Select } from "@/components/select/index";
import { defaultStyles } from "@/components/select/styles";

import { XCircleIcon } from "@heroicons/react/24/outline";
import * as HeroIcons from "@heroicons/react/24/solid";

const iconNames = Object.keys(HeroIcons);

const HeroIconSelect = forwardRef<any, SelectProps>((props, ref) => {
  return (
    <Select
      ref={ref}
      options={iconNames.map((iconName) => ({
        value: iconName,
        label: iconName
      }))}
      styles={{
        ...defaultStyles,
        menu: (provided, props) => ({
          ...defaultStyles.menu(provided, props),
          width: "250px"
        }),
        menuList: (provided, props) => ({
          ...defaultStyles.menuList(provided, props),
          width: "250px"
        })
      }}
      components={{
        Option: (props) => {
          const IconComponent = HeroIcons[props?.data?.value as keyof typeof HeroIcons];
          return (
            <components.Option {...props}>
              <ErrorBoundary fallback={<XCircleIcon className="h-6 w-6 text-white" />}>
                <IconComponent className="h-6 w-6" />
              </ErrorBoundary>
            </components.Option>
          );
        },
        SingleValue: (props) => {
          const IconComponent = HeroIcons[props?.data?.value as keyof typeof HeroIcons];
          return (
            <components.SingleValue {...props}>
              <ErrorBoundary fallback={<XCircleIcon className="h-6 w-6 text-white" />}>
                <IconComponent className="h-6 w-6" />
              </ErrorBoundary>
            </components.SingleValue>
          );
        },
        MenuList: (props) => {
          return (
            <components.MenuList {...props}>
              <div className="grid grid-cols-4 gap-4">{props.children}</div>
            </components.MenuList>
          );
        }
      }}
      {...props}
    />
  );
});

export default HeroIconSelect;
