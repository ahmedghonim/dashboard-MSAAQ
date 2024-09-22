import React, { FC, ReactNode } from "react";

import { classNames } from "@/utils";

interface TabsGroupProps {
  className?: string;
  children: ReactNode;
}

const TabsGroup: FC<TabsGroupProps> = ({ className, children }) => {
  return (
    <div
      className={classNames("rounded-lg border border-gray", className)}
      children={children}
    />
  );
};
type TabsGroup<P = {}> = FC<P>;
export default TabsGroup as TabsGroup<TabsGroupProps>;
