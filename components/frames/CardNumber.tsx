import React from "react";

import clsx from "clsx";

import { CARD_NUMBER_FRAME } from "@/components/frames/config";

const CardNumber = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(CARD_NUMBER_FRAME, className)}
      {...props}
    />
  )
);
CardNumber.displayName = "CardNumber";

export default CardNumber;
