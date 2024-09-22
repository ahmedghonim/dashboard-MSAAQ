import React, { forwardRef } from "react";

import { useRouter } from "next/router";

import { Trans, useTranslation } from "next-i18next";
import { CSSObjectWithLabel, components } from "react-select";

import { search } from "@/actions/options";
import { Price, Time, UserAvatar } from "@/components";
import { SelectProps } from "@/components/select/Select";
import { Select } from "@/components/select/index";
import { defaultStyles } from "@/components/select/styles";
import { StringHelper, getStatusColor } from "@/utils";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { Badge, Icon, Typography } from "@msaaqcom/abjad";

const Search = forwardRef<any, SelectProps>(({ ...props }, ref) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSelectedOption = async (option: any) => {
    if (!option?.type || !option?.value) {
      return;
    }

    const routes: any = {
      members: "/students/[id]",
      articles: "/blog/[id]/edit",
      courses: "/courses/[id]",
      orders: "/orders/[id]",
      products: "/products/[id]"
    };

    return await router.push({
      pathname: routes[option.type] ?? option.type,
      query: {
        id: option.value
      }
    });
  };

  const Option = ({ children, data }: any) => {
    if (!data) {
      return children;
    }
    switch (data.type) {
      case "members":
        return (
          <UserAvatar
            // @ts-ignore
            user={{
              ...data,
              name: data.label,
              avatar: data.thumbnail
            }}
          />
        );
      case "orders":
        return (
          <div className="flex items-center justify-between">
            <div>
              <Price
                price={data.total}
                currency={data.currency}
              />
              <div className="flex items-center gap-2">
                <span
                  dir="auto"
                  className="text-gray-700"
                  children={StringHelper.limit(data.title, 18)}
                />
                <Badge
                  size="sm"
                  variant={getStatusColor(data.status)}
                  children={<Trans i18nKey={`orders.statuses.${data.status}`} />}
                  rounded
                  soft
                />
              </div>
            </div>
            <Time
              date={data.created_at}
              className="text-gray-700"
            />
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <Select
      ref={ref}
      placeholder={t("search_input_placeholder")}
      isClearable
      className="app-search-input"
      isCompact
      openMenuOnClick={false}
      loadOptions={search}
      onChange={handleSelectedOption}
      styles={{
        ...defaultStyles,
        valueContainer: (provided: CSSObjectWithLabel) => ({
          ...provided,
          paddingInlineStart: 8
        })
      }}
      formatGroupLabel={(data) => (
        <div className="mb-2 flex items-center justify-between">
          <Typography.Paragraph
            children={t(`${data.label}.title`)}
            weight="medium"
          />

          <Badge
            size="xs"
            rounded
            soft
            variant="default"
            children={data.options.length}
          />
        </div>
      )}
      components={{
        DropdownIndicator: () => null,
        Option: (props) => (
          <components.Option {...props}>
            <Option {...props} />
          </components.Option>
        ),
        Control: ({ children, ...props }) => (
          <components.Control {...props}>
            <Icon
              className="text-gray-700 ltr:ml-3 rtl:mr-3"
              children={<MagnifyingGlassIcon />}
            />

            {children}
          </components.Control>
        )
      }}
    />
  );
});

export default Search;
