import React, { FC, HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils";

import { Typography } from "@msaaqcom/abjad";

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  title?: string;
}

const CardBody: FC<CardBodyProps> = ({ children, title, className, ...props }) => {
  return title ? (
    <div
      className={classNames("flex flex-col p-4", className)}
      {...props}
    >
      <Typography.Paragraph
        weight="normal"
        as="h3"
        children={title}
        className="mb-4"
      />
      {children}
    </div>
  ) : (
    <div
      className={classNames("p-4", className)}
      children={children}
      {...props}
    />
  );
};

type CardBody<P = {}> = FC<P>;
export default CardBody as CardBody<CardBodyProps>;
