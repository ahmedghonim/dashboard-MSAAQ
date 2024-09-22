import { FieldErrors } from "react-hook-form/dist/types/errors";
import { Control, UseFormGetValues, UseFormWatch } from "react-hook-form/dist/types/form";

import { SingleFile } from "@msaaqcom/abjad";

export const VERIFICATION_STEPS = {
  COUNTRY_AND_ACTIVITY_TYPE: 0,
  IDENTITY_VERIFICATION: 1,
  ACTIVITY_VERIFICATION: 2,
  BANK_ACCOUNT_INFORMATION: 3
};

export const ENTITY_TYPES = {
  TYPE_INDIVIDUAL: "individual",
  TYPE_FOUNDATION: "foundation",
  TYPE_COMPANY: "company"
};

export const ENTITY_TYPES_OPTIONS = [
  {
    label: "فرد",
    value: ENTITY_TYPES.TYPE_INDIVIDUAL
  },
  {
    label: "مؤسسة",
    value: ENTITY_TYPES.TYPE_FOUNDATION
  },
  {
    label: "شركة",
    value: ENTITY_TYPES.TYPE_COMPANY
  }
];

export const OWNER_ID_TYPES = {
  OWNER_ID_TYPE_NATIONAL_ID: "national_id",
  OWNER_ID_TYPE_PASSPORT: "passport",
  OWNER_ID_TYPE_DRIVING_LICENSE: "driving_license",
  OWNER_ID_TYPE_OTHER: "other"
};

export const OWNER_ID_TYPES_OPTIONS = [
  {
    label: "الهوية الوطنية",
    value: OWNER_ID_TYPES.OWNER_ID_TYPE_NATIONAL_ID
  },
  {
    label: "جواز السفر",
    value: OWNER_ID_TYPES.OWNER_ID_TYPE_PASSPORT
  },
  {
    label: "رخصة القيادة",
    value: OWNER_ID_TYPES.OWNER_ID_TYPE_DRIVING_LICENSE
  },
  {
    label: "أخرى",
    value: OWNER_ID_TYPES.OWNER_ID_TYPE_OTHER
  }
];

export interface IAcademyVerificationFormInputs {
  //step 0
  country_code: {
    label: string;
    value: any;
  };
  type: {
    label: string;
    value: any;
  };
  has_tax_number: boolean;
  tax_number: string;
  tax_number_certificate_image: Array<SingleFile>;
  terms: boolean;
  //end step 0

  //step 1
  owner_id_number_front_image: Array<SingleFile>;
  owner_id_number_back_image: Array<SingleFile>;
  freelancing_licence: Array<SingleFile>;
  owner_legal_name: string;
  owner_id_number: string;
  owner_phone: {
    number: string;
    name: string;
    dialCode: string;
    countryCode: string;
    format: string;
  };
  owner_birthday: string;
  owner_nationality: {
    label: string;
    value: any;
  };
  owner_id_type: { label: string; value: any };
  address: {
    region: string;
    city: string;
    postcode: string;
    address: string;
  };
  //end step 1

  //step 2
  legal_name: string;
  commercial_register: string;
  commercial_register_image: Array<SingleFile>;
  //end step 2

  //step 3
  bank: {
    account_name: string;
    bank_name: string;
    account_number: string;
    currency: {
      label: string;
      value: any;
    };
    iban: string;
    bic: string;
    iban_certificate_image: Array<SingleFile>;
  };
  //end step 3
}

export interface StepProps {
  control: Control<IAcademyVerificationFormInputs>;
  errors: FieldErrors<IAcademyVerificationFormInputs>;
  getValues: UseFormGetValues<IAcademyVerificationFormInputs>;
  watch: UseFormWatch<IAcademyVerificationFormInputs>;
  isValid: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
}

export * from "./steps";
