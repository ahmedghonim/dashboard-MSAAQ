import React, { HTMLAttributes, forwardRef } from "react";

interface Props extends HTMLAttributes<SVGSVGElement> {}

const UpgradeIcon = forwardRef<SVGSVGElement, Props>((props: Props, ref) => (
  <svg
    width={20}
    height={20}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      d="m16.458 14.03-.298 1.292a.58.58 0 0 1-.566.45H3.989a.58.58 0 0 1-.566-.45l-.298-1.292h13.334Zm1.443-6.253-1.175 5.093H2.856L1.681 7.777a.581.581 0 0 1 .854-.634l3.591 2.053 3.182-4.773a.582.582 0 0 1 .941-.034l3.731 4.797 3.034-2.022a.581.581 0 0 1 .887.613Z"
      fill="url(#a)"
    />
    <defs>
      <linearGradient
        id="a"
        x1={21.064}
        y1={-1.981}
        x2={-6.01}
        y2={-0.054}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7EDC88" />
        <stop
          offset={1}
          stopColor="#1770F5"
        />
      </linearGradient>
    </defs>
  </svg>
));

export default UpgradeIcon;
