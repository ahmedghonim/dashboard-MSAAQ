import { Academy, User } from "@/types";

export type Auth = {
  token: string | undefined;
  academies: Array<Academy>;
  user: User;
};
