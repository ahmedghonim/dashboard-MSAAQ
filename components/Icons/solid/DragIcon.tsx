import React, { createElement, forwardRef } from "react";

interface Props {
  title?: string;
  titleId?: string;
}

const DragIcon = forwardRef<SVGElement, Props>(({ title, titleId, ...props }: Props, svgRef) => {
  return createElement(
    "svg",
    Object.assign(
      {
        viewBox: "0 0 20 20",
        fill: "currentColor",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true",
        ref: svgRef,
        "aria-labelledby": titleId
      },
      props
    ),
    title
      ? createElement(
          "title",
          {
            id: titleId
          },
          title
        )
      : null,
    createElement("path", {
      fillRule: "evenodd",
      d: "M6 4.25C6 3.55964 6.55964 3 7.25 3C7.94036 3 8.5 3.55964 8.5 4.25C8.5 4.94036 7.94036 5.5 7.25 5.5C6.55964 5.5 6 4.94036 6 4.25ZM6 9.25C6 8.55964 6.55964 8 7.25 8C7.94036 8 8.5 8.55964 8.5 9.25C8.5 9.94036 7.94036 10.5 7.25 10.5C6.55964 10.5 6 9.94036 6 9.25ZM6 14.25C6 13.5596 6.55964 13 7.25 13C7.94036 13 8.5 13.5596 8.5 14.25C8.5 14.9404 7.94036 15.5 7.25 15.5C6.55964 15.5 6 14.9404 6 14.25Z",
      clipRule: "evenodd"
    }),
    createElement("path", {
      fillRule: "evenodd",
      d: "M11.5 4.25C11.5 3.55964 12.0596 3 12.75 3C13.4404 3 14 3.55964 14 4.25C14 4.94036 13.4404 5.5 12.75 5.5C12.0596 5.5 11.5 4.94036 11.5 4.25ZM11.5 9.25C11.5 8.55964 12.0596 8 12.75 8C13.4404 8 14 8.55964 14 9.25C14 9.94036 13.4404 10.5 12.75 10.5C12.0596 10.5 11.5 9.94036 11.5 9.25ZM11.5 14.25C11.5 13.5596 12.0596 13 12.75 13C13.4404 13 14 13.5596 14 14.25C14 14.9404 13.4404 15.5 12.75 15.5C12.0596 15.5 11.5 14.9404 11.5 14.25Z",
      clipRule: "evenodd"
    })
  );
});

export default DragIcon;
