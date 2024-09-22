import { useContext, useEffect } from "react";

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";

import { deleteCookie, setCookie } from "cookies-next";
import { signIn } from "next-auth/react";

import { ACCESS_TOKEN_COOKIE_KEY, CURRENT_ACADEMY_COOKIE_KEY, FreshchatContext } from "@/contextes";
import { setCurrentAcademyId } from "@/lib/axios";
import { fetchAccessToken, getWildcardCookiePath } from "@/utils";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.url) {
    return {
      notFound: true
    };
  }

  let accessToken = await fetchAccessToken();

  return {
    props: {
      access_token: accessToken
    }
  };
};

const Passwordless: NextPage = ({ access_token }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { logout: clearFreshChat } = useContext(FreshchatContext);
  const { url: endpoint } = router.query;

  useEffect(() => {
    if (access_token) {
      setCookie("access_token", access_token);
    }
  }, [access_token]);

  useEffect(() => {
    clearFreshChat();

    deleteCookie(ACCESS_TOKEN_COOKIE_KEY, { domain: getWildcardCookiePath() });
    deleteCookie(CURRENT_ACADEMY_COOKIE_KEY, { domain: getWildcardCookiePath() });
    const academyId = new URL(endpoint as string).searchParams.get("academy_id");

    const auth = async () => {
      const login = (await signIn("credentials", {
        endpoint,
        redirect: false
      })) as any;

      if (login.ok) {
        setCookie("academy_id", academyId);
        setCurrentAcademyId(academyId);

        return window.location.replace("/");
      }

      return router.push("/login");
    };

    if (endpoint) {
      auth();
    }
  }, [endpoint]);

  return <></>;
};

export default Passwordless;
