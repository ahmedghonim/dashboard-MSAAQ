import React from "react";

import clsx from "clsx";

import { EXPIRY_DATE_FRAME } from "@/components/frames/config";

const ExpiryDate = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(EXPIRY_DATE_FRAME, className)}
      {...props}
    />
  )
);
ExpiryDate.displayName = "ExpiryDate";

export default ExpiryDate;
