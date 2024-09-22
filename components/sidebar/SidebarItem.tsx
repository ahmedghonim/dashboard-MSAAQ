import React, { FC, HTMLProps } from "react";

import { SidebarItemContext } from "@/components/sidebar/SidebarContext";
import { classNames } from "@/utils";

import styles from "./_sidebar.module.scss";

export interface SidebarItemProps extends HTMLProps<HTMLLinkElement> {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ children, className, light = false }: SidebarItemProps) => {
  return (
    <SidebarItemContext.Provider
      value={{
        light
      }}
    >
      <div className={classNames(styles["sidebar-item"], className)}>{children}</div>
    </SidebarItemContext.Provider>
  );
};

type SidebarItem<P = {}> = FC<P> & {};

export default SidebarItem as SidebarItem<SidebarItemProps>;
