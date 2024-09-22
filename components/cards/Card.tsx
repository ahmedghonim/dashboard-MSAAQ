import React, { FC, HTMLAttributes, ReactNode, createElement, useMemo } from "react";

import CardActions from "@/components/cards/CardActions";
import CardAuthor from "@/components/cards/CardAuthor";
import CardBody from "@/components/cards/CardBody";
import CardHeader from "@/components/cards/CardHeader";
import { classNames } from "@/utils";

import { Typography } from "@msaaqcom/abjad";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  as?: any;
  className?: string;
  label?: string;
}

const Card: FC<CardProps> = ({ children, as = "div", className, label, ...props }) => {
  const bg = useMemo<string>(() => (/^.*bg-.*$/.test(className ?? "") ? "" : "bg-white"), [className]);

  return (
    <div className={classNames("flex w-full flex-col", className)}>
      {label && (
        <Typography.Paragraph
          weight="medium"
          children={label}
          className="mb-2"
        />
      )}

      {createElement(
        as,
        {
          className: classNames("flex flex-col rounded-lg border border-gray-300 h-full", bg),
          ...props
        },
        children
      )}
    </div>
  );
};

type CardComponent<P = {}> = FC<P> & {
  Header: typeof CardHeader;
  Author: typeof CardAuthor;
  Body: typeof CardBody;
  Actions: typeof CardActions;
};

export default Card as CardComponent<CardProps>;
