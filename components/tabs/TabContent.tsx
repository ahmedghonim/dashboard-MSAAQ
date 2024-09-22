import React, { FC, ReactNode } from "react";

import { classNames } from "@/utils";

interface TabContentProps {
  className?: string;
  children: ReactNode;
}

const TabContent: FC<TabContentProps> = ({ className, children }) => {
  return (
    <div
      className={classNames("px-4 py-6", className)}
      children={children}
    />
  );
};
type TabContent<P = {}> = FC<P>;
export default TabContent as TabContent<TabContentProps>;
