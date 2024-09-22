import React, { FC, HTMLProps, createElement, useContext } from "react";

import { SidebarItemContext } from "@/components/sidebar/SidebarContext";
import { AuthContext } from "@/contextes";
import { classNames } from "@/utils";

import { Icon, Typography } from "@msaaqcom/abjad";

export interface SidebarLinkProps extends HTMLProps<HTMLLinkElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  active?: boolean;
  as?: string | any;
}

const SidebarLink: FC<SidebarLinkProps> = ({
  as = "a",
  children,
  className,
  active = false,
  icon,
  ...props
}: SidebarLinkProps) => {
  const { current_academy } = useContext(AuthContext);
  const { light } = useContext(SidebarItemContext);

  return createElement(as, {
    ...props,
    className: classNames(
      "flex items-center rounded",
      "hover:text-white",
      active
        ? `text-white ${light ? "" : current_academy.is_plus ? "bg-white/10" : "bg-white/5"}`
        : current_academy.is_plus
        ? "text-gray-300"
        : "text-primary-300",
      light ? "p-2" : "p-2",
      className
    ),
    children: (
      <>
        {icon && (
          <Icon
            size="md"
            className="ml-2"
            children={icon}
          />
        )}
        <div className="relative w-full">
          {light && active && (
            <span
              className={classNames(
                "absolute right-3 top-1/2",
                "h-4 w-[2px]",
                "-translate-y-1/2 transform",
                "rounded-full bg-success"
              )}
            ></span>
          )}
          <Typography.Paragraph
            size="md"
            as="div"
            weight={light ? "normal" : "medium"}
            className={classNames("flex w-full", light && "pr-6 font-normal", light && active && "text-white")}
            children={children}
          />
        </div>
      </>
    )
  });
};

type SidebarLink<P = {}> = FC<P> & {};

export default SidebarLink as SidebarLink<SidebarLinkProps>;
