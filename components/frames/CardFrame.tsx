import React from "react";

import clsx from "clsx";

import { CARD_FRAME } from "@/components/frames/config";

const CardFrame = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(CARD_FRAME, className)}
      {...props}
    />
  )
);
CardFrame.displayName = "CardFrame";

export default CardFrame;
