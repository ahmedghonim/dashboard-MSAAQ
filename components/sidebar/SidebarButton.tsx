import React, { FC, HTMLAttributes, createElement } from "react";

import { classNames } from "@/utils";

export interface SidebarButtonProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
  as?: string | any;
}

const SidebarButton: FC<SidebarButtonProps> = ({
  as = "button",
  className,
  children,
  ...props
}: SidebarButtonProps) => {
  return createElement(as, {
    ...props,
    className: classNames(
      "sidebar-button",
      "flex items-center rounded bg-white px-3 py-2.5 text-primary",
      "hover:bg-secondary hover:text-primary",
      className
    ),
    children: children
  });
};

type SidebarButton<P = {}> = FC<P> & {};

export default SidebarButton as SidebarButton<SidebarButtonProps>;
