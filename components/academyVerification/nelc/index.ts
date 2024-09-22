import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormReturn,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch
} from "react-hook-form";

import { SingleFile } from "@msaaqcom/abjad";

export const VERIFICATION_STEPS = {
  BASICـINFORMATION: 0,
  ENTITYـDATA: 1,
  PAYMENTـFEES: 2,
  OBTAININGـLICENSE: 3
};

export const ENTITY_TYPES = {
  TYPE_GOVERNMENTAL: "public",
  TYPE_PRIVATE: "private",
  TYPE_NON_PROFIT_NO_COMMERCIAL_REGISTER: "non_profit_without_commercial_registration",
  TYPE_NON_PROFIT_COMMERCIAL_REGISTER: "non_profit_with_commercial_registration"
};

export const ENTITY_LICENSE_TYPE = {
  TYPE_HIGH_EDUCATION: "high_education",
  TYPE_GENERAL_EDUCATION: "general_education",
  TYPE_TRAINING: "training"
};

export const TYPE_HIGH_EDUCATION_OPTIONS = {
  TYPE_UNIVERSITIES: "university",
  TYPE_INSTITUTE: "institute"
};
export const TYPE_GENERAL_EDUCATION = {
  TYPE_COLLAGE: "college"
};
export const TYPE_TRAINING = {
  TYPE_STARTUP: "startup",
  TYPE_TRAINING_CENTER: "training_center",
  TYPE_INSTITUTE: "institute",
  TYPE_OTHER: "other"
};

export const ENTITY_TYPES_OPTIONS = [
  {
    label: "حكومي",
    value: ENTITY_TYPES.TYPE_GOVERNMENTAL
  },
  {
    label: "خاص",
    value: ENTITY_TYPES.TYPE_PRIVATE
  },
  {
    label: "غير ربحي بدون سجل تجاري",
    value: ENTITY_TYPES.TYPE_NON_PROFIT_NO_COMMERCIAL_REGISTER
  },
  {
    label: "قطاع غير ربحي بسجل تجاري",
    value: ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER
  }
];
export const ENTITY_LICENSE_OPTIONS = [
  {
    label: "تعليم عالي",
    value: ENTITY_LICENSE_TYPE.TYPE_HIGH_EDUCATION
  },
  {
    label: "تعليم عام",
    value: ENTITY_LICENSE_TYPE.TYPE_GENERAL_EDUCATION
  },
  {
    label: "تدريب",
    value: ENTITY_LICENSE_TYPE.TYPE_TRAINING
  }
];

export const FACILITY_HIGH_EDUCATION_OPTIONS = [
  {
    label: "جامعات",
    value: TYPE_HIGH_EDUCATION_OPTIONS.TYPE_UNIVERSITIES
  },
  {
    label: "كليات",
    value: TYPE_HIGH_EDUCATION_OPTIONS.TYPE_INSTITUTE
  }
];

export const FACILITY_GENERAL_EDUCATION_OPTIONS = [
  {
    label: "مدارس",
    value: TYPE_GENERAL_EDUCATION.TYPE_COLLAGE
  }
];

export const FACILITY_TRAINING_OPTIONS = [
  {
    label: "منصة",
    value: TYPE_TRAINING.TYPE_STARTUP
  },
  {
    label: "مركز تدريب",
    value: TYPE_TRAINING.TYPE_TRAINING_CENTER
  },
  {
    label: "أكاديميات",
    value: TYPE_TRAINING.TYPE_INSTITUTE
  },
  {
    label: "اخرى",
    value: TYPE_TRAINING.TYPE_OTHER
  }
];

export interface INelcVerificationFormInputs {
  type: {
    label: string;
    value: any;
  };
  education_license_type: {
    label: string;
    value: any;
  };
  organization_type: {
    label: string;
    value: any;
  };
  city: {
    label: string;
    value: any;
  };
  redirect_url: string;
  arabic_name: string;
  commercial_register: string;
  status: string;
  commercial_register_issue_date: string;
  commercial_register_expiry_date: string;
  national_id: string;
  commercial_activity: string;
  english_name: string;
  status_value: string;
  official_website: string;
  logo: Array<SingleFile>;
  entity_license_type: {
    label: string;
    value: any;
  };
  sector: {
    label: string;
    value: any;
  };
  activity_license_number: string;
  activity_license_expiry_date: string;
  other: string;
  activity_license_image: Array<SingleFile>;
}

export interface StepProps {
  control: Control<INelcVerificationFormInputs>;
  errors: FieldErrors<INelcVerificationFormInputs>;
  form: UseFormReturn<INelcVerificationFormInputs>;
  setValue: UseFormSetValue<INelcVerificationFormInputs>;
  getValues: UseFormGetValues<INelcVerificationFormInputs>;
  watch: UseFormWatch<INelcVerificationFormInputs>;
  trigger: UseFormTrigger<INelcVerificationFormInputs>;
  isValid: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  cities?: Array<{ label: string; value: string }>;
  facilities?: Array<{ label: string; value: string }>;
}
