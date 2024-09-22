import React, { FC, HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

const CardHeader: FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames("rounded-t-lg border-b border-gray-300 p-4", className)}
      children={children}
      {...props}
    />
  );
};
type CardHeader<P = {}> = FC<P>;
export default CardHeader as CardHeader<CardHeaderProps>;
