import React, { forwardRef } from "react";

import { searchInSegments } from "@/actions/options";
import { Select } from "@/components/select";
import { SelectProps } from "@/components/select/Select";

const SegmentsSelect = forwardRef<any, SelectProps>(({ ...props }, ref) => {
  return (
    <Select
      ref={ref}
      isMulti
      loadOptions={searchInSegments}
      isOptionDisabled={(option) => option.isDisabled}
      {...props}
    />
  );
});
export default SegmentsSelect;
