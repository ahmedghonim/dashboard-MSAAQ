import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// @ts-ignore
import convert from "color-convert";

import { isCustomizedDomain } from "@/hooks";
import { Academy } from "@/types";
import colorShades from "@/utils/colorShades";

import { AuthContext } from "./AuthContext";

const CustomTemplateContext = createContext(
  {} as {
    tenantLogo?: string;
    tenantFavicon?: string;
    tenantTitle?: string;
    setTenant?: (tenant: Academy) => void;
  }
);

const CustomTemplateProvider = ({ children }: { children: ReactNode }) => {
  const { current_academy } = useContext(AuthContext);

  const [currentTenant, setCurrentTenant] = useState<Academy | undefined>(current_academy);

  const resolveColors = (color: string, name: string) => {
    const resolvedColors = colorShades(color);

    const prefix = "ms";
    const colorName = (key: string) => (key === "500" ? `${name}` : `${name}-${key}`);

    const result: Record<string, string> = {};

    Object.keys(resolvedColors ?? {}).map((key) => {
      const cname = colorName(key);
      const abjadColorVariable = `--${prefix}-${cname}`;

      const [h, s, l] = convert.hex.hsl(resolvedColors?.[key] as string);

      result[abjadColorVariable] = `hsl(${h} ${s}% ${l}%)`;
    });

    return Object.keys(result)
      .map((key) => `${key}: ${result[key]};`)
      .join("\n");
  };

  if (!isCustomizedDomain()) {
    return (
      <CustomTemplateContext.Provider
        value={{
          setTenant: setCurrentTenant
        }}
      >
        {children}
      </CustomTemplateContext.Provider>
    );
  }

  useEffect(() => {
    if (isCustomizedDomain() && currentTenant?.favicon) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
      if (link) {
        link.href = currentTenant.favicon;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "shortcut icon";
        newLink.href = "https://cdn.msaaq.com/assets/images/logo/favicon.png";
        document.head.appendChild(newLink);
      }
    }
  }, [currentTenant]);

  if (isCustomizedDomain() && currentTenant) {
    const tenantLogo = currentTenant?.logo;
    const tenantFavicon = currentTenant?.favicon;
    const tenantTitle = currentTenant?.title;

    return (
      <CustomTemplateContext.Provider
        value={{
          setTenant: (tenant: Academy) => {
            setCurrentTenant(tenant);
          },
          tenantLogo: tenantLogo,
          tenantTitle: tenantTitle,
          tenantFavicon: tenantFavicon
        }}
      >
        <style
          jsx
          global
        >{`
          :root {
            ${resolveColors(currentTenant?.colors?.primary, "primary")};
            ${resolveColors(currentTenant?.colors?.secondary, "secondary")};
          }
        `}</style>
        {children}
      </CustomTemplateContext.Provider>
    );
  } else {
    return (
      <CustomTemplateContext.Provider
        value={{
          setTenant: setCurrentTenant
        }}
      >
        {children}
      </CustomTemplateContext.Provider>
    );
  }
};

export { CustomTemplateContext, CustomTemplateProvider };
