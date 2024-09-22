import React, { FC, HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils";

interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

const CardActions: FC<CardActionsProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames("mt-auto flex items-center rounded-b-lg border-t border-gray-300 p-4", className)}
      children={children}
      {...props}
    />
  );
};

type CardActions<P = {}> = FC<P>;
export default CardActions as CardActions<CardActionsProps>;
