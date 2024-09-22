import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { isCustomizedDomain } from "@/hooks";
import i18nextConfig from "@/next-i18next.config.js";
import { Academy } from "@/types";

import { fetchAccessToken, fetchTenant } from "..";

export interface ExtendedGetServerSidePropsContext extends GetServerSidePropsContext {
  tenant: {
    data: Academy;
  };
  access_token: string | null;
  NEXTAUTH_URL: string;
}

export function withAuthGetServerSideProps<P extends ExtendedGetServerSidePropsContext>(
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> {
  return async (context) => {
    const { locale, req } = context;
    let host = req.headers.host;

    const accessToken = await fetchAccessToken();
    let tenant;
    if (isCustomizedDomain(host as string) && host) {
      tenant = await fetchTenant({
        accessToken: accessToken,
        tenantUrl: host?.split(".").slice(1).join(".") as string
      });
    }

    const commonProps = {
      tenant: tenant ? tenant : {},
      access_token: accessToken,
      NEXTAUTH_URL: host ?? (process.env.NEXTAUTH_URL as string),
      ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
    } as any;

    if (getServerSidePropsFunc) {
      const additionalProps = await getServerSidePropsFunc(context);

      if (typeof additionalProps === "object" && "props" in additionalProps && additionalProps) {
        return {
          props: {
            ...commonProps,
            ...additionalProps.props
          }
        };
      }

      return additionalProps;
    }

    return {
      props: commonProps
    };
  };
}
