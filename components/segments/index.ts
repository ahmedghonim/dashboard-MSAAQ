import { FieldErrors } from "react-hook-form/dist/types/errors";
import { Control, UseFormWatch } from "react-hook-form/dist/types/form";

import { SegmentConditionOperatorType, SegmentConditionType } from "@/types";

interface IMembersSegmentsConditionsFormInputs {
  name: string;
  icon: {
    label: string;
    value: string;
  };
  conditions: Array<{
    type: {
      label: string;
      value: SegmentConditionType;
    };
    operator?: {
      label: string;
      value: SegmentConditionOperatorType;
    };
    //required when operator = between
    max_value?: number | string;
    //required when operator = between
    min_value?: number | string;
    //required when operator = gte, lte, gt, lt, equal
    value:
      | string
      | number
      | {
          label: string;
          value: string;
        };
  }>;
}

export interface ConditionProps {
  control: Control<IMembersSegmentsConditionsFormInputs>;
  errors: FieldErrors<IMembersSegmentsConditionsFormInputs>;
  watch: UseFormWatch<IMembersSegmentsConditionsFormInputs>;
  index: number;
}
