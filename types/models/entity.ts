export type EntitySection = {
  action: "submitted" | "approved" | "declined" | "pending";
  section: "full_entity" | "id" | "commercial_register" | "bank_account";
  reason?: string;
  action_date: string;
};
export type EntityAction = {
  id: string;
  action: "submitted" | "approved" | "declined" | "pending";
  sections: Array<EntitySection>;
  progress: number;
  created_at: string;
};

export type Entity = {
  id: number;
  country_code: string;
  type: "individual" | "foundation" | "company";
  legal_name: string;
  owner_legal_name: string;
  owner_birthday: string;
  owner_nationality: string;
  owner_id_type: string;
  owner_id_number: string;
  owner_phone: string;
  owner_phone_code: string;
  owner_id_number_front_image: {
    id: number;
    name: string;
    url: string;
    size: string;
    mime: string;
  };
  owner_id_number_back_image: {
    id: number;
    name: string;
    url: string;
    size: string;
    mime: string;
  };
  freelancing_licence: null;
  commercial_register: string;
  commercial_register_image: null;
  address: {
    id: string;
    country_code: string;
    region: string;
    city: string;
    address: string;
    is_default: boolean;
    postcode: string;
  };
};
