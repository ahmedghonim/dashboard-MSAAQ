import { DefaultSession } from "next-auth";
import { User } from "next-auth/core/types";

import { Academy } from "@/types/models";

export interface AuthResponse {
  access_token: string;
  user: User & DefaultSession["user"];
  academies: Array[Academy];
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends AuthResponse {}
}
