import React from "react";

import clsx from "clsx";

import { SCHEME_CHOICE_FRAME } from "@/components/frames/config";

const SchemeChoice = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(SCHEME_CHOICE_FRAME, className)}
      {...props}
    />
  )
);
SchemeChoice.displayName = "SchemeChoice";

export default SchemeChoice;
