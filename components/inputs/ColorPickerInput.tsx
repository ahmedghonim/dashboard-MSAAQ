import { forwardRef, useCallback, useRef, useState } from "react";

import { HexColorPicker } from "react-colorful";

import useClickOutside from "@/hooks/useClickOutside";
import { classNames } from "@/utils";

import { Form } from "@msaaqcom/abjad";

interface ColorPickerProps {
  value: string;
  name: string;
  onChange: (color: string) => void;
}

const ColorPickerInput = forwardRef<HTMLDivElement, ColorPickerProps>(({ value, name, onChange }, ref) => {
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  const popover = useRef<HTMLDivElement>(null);

  useClickOutside(popover, close);

  return (
    <div
      className={classNames("relative", isOpen ? "z-50" : "")}
      ref={ref}
    >
      <Form.Input
        name={name}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        className="px-8"
        onClick={() => toggle(true)}
      />
      <div className="absolute top-2/4 -translate-y-2/4 px-4">
        <div
          className="h-7 w-7 cursor-pointer rounded-full border border-gray"
          style={{ backgroundColor: value }}
          onClick={() => toggle(true)}
        />
        {isOpen && (
          <div
            className="top-[calc(100% + 2px)] absolute right-4 rounded-md shadow"
            ref={popover}
          >
            <HexColorPicker
              color={value}
              onChange={onChange}
            />
          </div>
        )}
      </div>
    </div>
  );
});
export default ColorPickerInput;
