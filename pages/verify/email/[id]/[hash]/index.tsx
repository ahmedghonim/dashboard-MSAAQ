import { useEffect } from "react";

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { deleteCookie, setCookie } from "cookies-next";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { ACCESS_TOKEN_COOKIE_KEY, CURRENT_ACADEMY_COOKIE_KEY } from "@/contextes";
import i18nextConfig from "@/next-i18next.config";
import { fetchAccessToken, getWildcardCookiePath } from "@/utils";

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  let accessToken = await fetchAccessToken();

  if (!query.id || !query.hash) {
    return {
      notFound: true
    };
  } else {
    return {
      props: {
        access_token: accessToken,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
      }
    };
  }
};

const Verify: NextPage = ({ access_token }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, hash } = router.query;

  useEffect(() => {
    if (access_token) {
      setCookie("access_token", access_token);
    }
  }, [access_token]);

  useEffect(() => {
    if (id && hash && access_token) {
      const endpoint = `/authentication/email/verify/${id}/${hash}`;
      deleteCookie(ACCESS_TOKEN_COOKIE_KEY, { domain: getWildcardCookiePath() });
      deleteCookie(CURRENT_ACADEMY_COOKIE_KEY, { domain: getWildcardCookiePath() });
      const auth = async () => {
        const login = (await signIn("credentials", {
          endpoint,
          redirect: false
        })) as any;

        if (login.ok) {
          router.push("/");
        } else {
          router.push("/login");
        }
      };

      auth();
    }
  }, [id, hash, access_token]);

  return (
    <>
      <Head>
        <title>{t("auth.login")}</title>
      </Head>
    </>
  );
};

export default Verify;
