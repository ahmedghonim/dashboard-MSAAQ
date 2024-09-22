import { AxiosResponse } from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { Session, User } from "next-auth/core/types";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { isCustomizedDomain } from "@/hooks";
import axios, { setAuthToken } from "@/lib/axios";
import { Auth } from "@/types";
import { AuthResponse } from "@/types/next-auth";
import { convertBooleans } from "@/utils";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      type: "credentials",
      credentials: {},
      async authorize(credentials, req): Promise<AdapterUser | AuthResponse | any> {
        const {
          endpoint = "/authentication/login",
          redirect,
          csrfToken,
          callbackUrl,
          json,
          ...payload
        } = credentials as any;
        const cookies = req.headers?.cookie.split("; ").reduce((acc: any, cookie: any) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {});

        const response = await axios
          .post(endpoint, convertBooleans(payload), {
            headers: {
              ...(isCustomizedDomain(req.headers?.host) && {
                "X-Academy-Domain": req.headers?.host?.split(".").slice(1).join(".")
              }),
              Authorization: `Bearer ${cookies.access_token}`
            }
          })
          .then((res: AxiosResponse<{ data: Auth }>) => res.data.data)
          .catch((err) => {
            if (err.response?.data?.error) {
              return Promise.reject(new Error(err.response.data.error));
            }

            return Promise.reject(err);
          });

        if (response) {
          setAuthToken(response.token);

          return {
            // user: response.user,
            access_token: response.token,
            academies: response?.academies
              ? response.academies.map((academy) => ({
                  id: academy.id,
                  domain: academy.domain
                }))
              : []
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
    newUser: "/register"
  },
  callbacks: {
    session(params: { session: Session | any; user: User | AdapterUser; token: JWT | any }) {
      params.session.access_token = params.token.access_token;
      params.session.user = params.token.user;
      params.session.academies = params.token.academies;

      return params.session;
    },
    jwt(params: { token: JWT; user?: User | AdapterUser | any; account?: any | null; isNewUser?: boolean }) {
      if (params.user?.access_token) {
        params.token.access_token = params.user.access_token;
      }

      if (params.user?.academies) {
        params.token.academies = params.user.academies;
      }

      if (params.user?.user) {
        params.token.user = params.user.user;
      }

      return params.token;
    }
  }
};

export default NextAuth(authOptions);
