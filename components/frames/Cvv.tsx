import React from "react";

import clsx from "clsx";

import { CVV_FRAME } from "@/components/frames/config";

const Cvv = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(CVV_FRAME, className)}
      {...props}
    />
  )
);
Cvv.displayName = "Cvv";

export default Cvv;
