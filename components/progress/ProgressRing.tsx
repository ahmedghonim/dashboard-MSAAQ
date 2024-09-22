import { forwardRef, useEffect, useMemo, useState } from "react";

import { classNames } from "@/utils";

const ProgressRing = forwardRef<
  HTMLDivElement,
  {
    value: number;
    color: any;
    size?: number;
    width?: number;
  }
>(({ value = 0, color, size = 30, width = 15 }, ref) => {
  const CIRCUMFERENCE = size * Math.PI;
  const [$color, setColor] = useState(color);
  const $value = parseFloat(value.toFixed(1));

  const strokeDashoffset = CIRCUMFERENCE - ($value / 100) * CIRCUMFERENCE;

  useEffect(() => {
    if ($value > 40) {
      setColor("success");
    }
    if ($value <= 40) {
      setColor("warning");
    }
    if ($value <= 20) {
      setColor("danger");
    }
  }, [$value]);
  return (
    <div
      ref={ref}
      className="abjad-progress-ring inline-flex items-center justify-center overflow-hidden rounded-full"
    >
      <svg
        style={{
          width: size,
          height: size
        }}
      >
        <circle
          className="text-black/[0.04]"
          strokeWidth={width}
          stroke="currentColor"
          fill="transparent"
          r={size / 2}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={classNames(`text-${$color}`)}
          strokeWidth={width}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          stroke="currentColor"
          fill="transparent"
          r={size / 2}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className={classNames("absolute text-sm font-semibold", `text-${$color}`)}
        children={`${$value}%`}
      />
    </div>
  );
});

export default ProgressRing;
