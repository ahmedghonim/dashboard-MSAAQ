import React, { FC } from "react";

import { classNames } from "@/utils";

export interface SidebarBrandProps {
  className?: string;
  children: React.ReactNode;
}

const SidebarBrand: FC<SidebarBrandProps> = ({ className, children }: SidebarBrandProps) => (
  <div
    className={classNames("flex flex-shrink-0 items-center px-2", className)}
    children={children}
  />
);

type SidebarBrand<P = {}> = FC<P> & {};

export default SidebarBrand as SidebarBrand<SidebarBrandProps>;
