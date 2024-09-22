type Instruction = {
  type: "NAMESERVER" | "CNAME";
  value: string;
  name: string;
};

export enum DomainStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export interface DomainRecord {
  id: string;
  zone_id: string;
  content: string;
  domain: string;
  name: string;
  priority: null | number;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  type: "CNAME" | "A" | "AAAA" | "TXT" | "SRV" | "LOC" | "MX" | "NS" | "SPF";
  created_at: string;
  updated_at: string;
}

export type Domain = {
  id: number;
  cf_zone_id: string | null;
  domain: string;
  is_subdomain: boolean;
  is_active: boolean;
  status: DomainStatus;
  registrar: string;
  instructions: Instruction[];
  verified_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};
