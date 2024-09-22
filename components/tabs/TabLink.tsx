import React, { FC, HTMLProps, ReactElement, ReactNode } from "react";

import { classNames } from "@/utils";

import { Menu, Typography } from "@msaaqcom/abjad";

export interface TabItemProps extends Omit<HTMLProps<HTMLLinkElement>, "href"> {
  active: boolean;
  href: string | Record<any, any>;
  as: string | ReactNode | any;
  children: ReactNode;
  badge?: ReactElement;
}

const TabLink: FC<TabItemProps> = ({ active, className, children, href, as = "a", ...props }: TabItemProps) => {
  return (
    <Menu.Item
      href={href as string}
      as={as}
      className={classNames(
        className,
        "inline-flex h-full h-full items-center border-b-2 px-4",
        active
          ? "border-secondary text-primary-950 hover:text-gray-950"
          : "border-transparent text-gray-700 hover:text-gray-800"
      )}
      children={
        <Typography.Paragraph
          as="span"
          weight="medium"
          children={children}
        />
      }
      {...props}
    />
  );
};

type TabLink<P = {}> = FC<P> & {};

export default TabLink as TabLink<TabItemProps>;
