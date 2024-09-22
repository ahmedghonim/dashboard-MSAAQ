import { CSSObjectWithLabel, ControlProps } from "react-select";
import { StylesProps } from "react-select/dist/declarations/src/styles";
import { GroupBase } from "react-select/dist/declarations/src/types";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "@/tailwind.config.js";

const { theme }: any = resolveConfig(tailwindConfig);

export declare type StylesConfig<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
> = {
  [K in keyof StylesProps<Option, IsMulti, Group>]?: (
    base: CSSObjectWithLabel,
    props: StylesProps<Option, IsMulti, Group>[K]
  ) => CSSObjectWithLabel;
};

export const defaultStyles: StylesConfig<unknown, true> | any = {
  container: (base: CSSObjectWithLabel, props: ControlProps<unknown, true>) => ({
    ...base,
    width: "100%"
  }),
  control: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    // @ts-ignore
    minHeight: state.selectProps?.isCompact ? 42 : 48,
    borderRadius: theme.borderRadius.md,
    borderColor: state.isDisabled
      ? theme.colors.gray[600]
      : state.isFocused
      ? theme.colors.primary["DEFAULT"]
      : theme.colors.gray["DEFAULT"],
    boxShadow: state.isFocused ? `0 0 0 2px ${theme.colors.primary[200]}` : "none",
    "&:hover": {
      borderColor: state.isFocused ? theme.colors.primary["DEFAULT"] : theme.colors.gray[600]
    },
    "&:focus": {
      borderColor: theme.colors.primary["DEFAULT"]
    }
  }),
  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    fontSize: 14,
    color: theme.colors.gray[700]
  }),
  valueContainer: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    paddingInlineStart: "var(--ms-form-control-padding-x)"
  }),
  menu: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    zIndex: "3",
    borderRadius: theme.borderRadius.md,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    border: `1px solid ${theme.colors.gray[300]}`,
    borderColor: state.isDisabled
      ? theme.colors.gray[600]
      : state.isFocused
      ? theme.colors.primary["DEFAULT"]
      : theme.colors.gray["DEFAULT"]
  }),
  menuList: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4
  }),
  option: (provided: CSSObjectWithLabel, state: ControlProps | any) => ({
    ...provided,
    fontSize: 14,
    borderRadius: theme.borderRadius.md,
    color: state.isSelected ? theme.colors.white : theme.colors.black,
    backgroundColor:
      state.isFocused && !state.isSelected
        ? theme.colors.primary[50]
        : state.isSelected
        ? theme.colors.primary["DEFAULT"]
        : "transparent",
    "&:active": {
      backgroundColor: state.isFocused || state.isSelected ? theme.colors.primary[100] : "transparent"
    }
  }),
  multiValue: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    borderRadius: "0.25rem",
    overflow: "hidden",
    backgroundColor: theme.colors.gray[200],

    "&:first-of-type": {
      marginInlineStart: 0
    }
  }),
  multiValueLabel: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    paddingInlineStart: 8,
    backgroundColor: theme.colors.gray[200]
  }),
  multiValueRemove: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    borderRadius: 0,
    backgroundColor: theme.colors.gray[200],
    "&:hover": {
      backgroundColor: theme.colors.gray[300],
      color: theme.colors.danger["DEFAULT"]
    }
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  dropdownIndicator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    cursor: "pointer",
    paddingInlineEnd: "var(--ms-form-control-padding-x)"
  }),
  clearIndicator: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    cursor: "pointer",
    paddingInlineEnd: "var(--ms-form-control-padding-x)"
  }),
  loadingIndicator: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    cursor: "progress",
    paddingInlineEnd: state.hasValue ? "var(--ms-form-control-padding-x)" : ""
  })
};

export const abstract = {
  multiValueLabel: defaultStyles.multiValueLabel,
  control: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    border: 0,
    boxShadow: "none",
    "&:hover": {
      border: 0
    }
  }),
  menu: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    zIndex: "3"
  }),
  option: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided
    // textAlign: 'left'
  }),
  indicatorSeparator: (provided: CSSObjectWithLabel, state: ControlProps) => ({})
};

export const multi = {
  ...defaultStyles,
  multiValue: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    margin: 0
  }),
  multiValueLabel: defaultStyles.multiValueLabel,
  input: (provided: CSSObjectWithLabel, state: ControlProps) => ({
    ...provided,
    width: "100%"
  })
};
