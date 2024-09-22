import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "next-auth/middleware";

import { setAuthToken, setCurrentAcademyId } from "@/lib/axios";
import { AuthResponse } from "@/types/next-auth";

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }: { token: AuthResponse | any }) {
        if (!token?.access_token) {
          return false;
        }

        setAuthToken(token.access_token);

        if (token?.academies && token?.academies.length) {
          setCurrentAcademyId(token?.academies[0].id);
        }

        return true;
      }
    }
  }
);

export const config = {
  matcher: [
    "/",
    "/((?!api|auth|verify|reset|passwordless|forgot-password|invitation|login|register|_next/static|images|favicon.ico).*)"
  ]
};
