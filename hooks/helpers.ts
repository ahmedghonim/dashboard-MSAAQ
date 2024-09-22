import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { getCookie } from "cookies-next";

import { useAppSelector } from "@/hooks/redux";
import dayjs from "@/lib/dayjs";
import { Chapter, Content, Course, Product, RoleTypes } from "@/types";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>; // Return success

export const useCopyToClipboard = (): [CopyFn, Array<CopiedValue>] => {
  const [copiedTexts, setCopiedTexts] = useState<Array<CopiedValue>>([]);
  let timeout: NodeJS.Timeout;
  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTexts((prev) => [...prev, text]);
      timeout = setTimeout(() => setCopiedTexts([]), 2000);
      return true;
    } catch (error) {
      setCopiedTexts([]);
      return false;
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return [copy, copiedTexts];
};

type IsActiveFn = (paths: string[] | string) => boolean;
export const useIsRouteActive = (): { isActive: IsActiveFn } => {
  const router = useRouter();

  const isActive = (paths: string[] | string) => {
    if (typeof paths === "string") {
      return router.pathname === paths;
    }

    return paths.some((path) => router.pathname === path || router.pathname.startsWith(path));
  };

  return { isActive };
};

interface FormatPriceReturnType {
  formatRawPrice: (
    amount: number,
    providedCurrency?: string | undefined,
    currencyDisplay?: "name" | "symbol"
  ) => string;
  formatRawPriceWithoutCurrency: (amount: number) => string;
  formatPlainPrice: (amount: number | string) => number;
  formatPrice: (amount: number, providedCurrency?: string | undefined, currencyDisplay?: "name" | "symbol") => string;
  formatPriceWithoutCurrency: (amount: number) => string;
  currentCurrency: string;
  currentCurrencySymbol: string;
  currentCurrencyLocalizeSymbol: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (providedCurrency?: string | undefined) => string;
}

export const useFormatPrice = (providedCurrency: string | undefined = undefined): FormatPriceReturnType => {
  const { currency: appCurrency, locale } = useAppSelector((state) => state.auth.current_academy);

  const [currency, setCurrency] = useState(appCurrency);

  useEffect(() => {
    if (providedCurrency) {
      setCurrency(providedCurrency);
    }
  }, [providedCurrency]);

  let arabicCurrencies = ["AED", "SAR", "BHD", "EGP", "KWD", "OMR", "QAR"];

  let lang = locale ? locale : arabicCurrencies.includes(currency) && "ar" ? "ar-DZ" : "en-US";

  const newFormatter = (
    providedCurrency: string | undefined = undefined,
    currencyDisplay: "name" | "symbol" = "name",
    preferLang: string | undefined = undefined
  ) => {
    return new Intl.NumberFormat((getCookie("current_locale") as string) ?? "ar", {
      style: "currency",
      currency: providedCurrency ?? currency ?? "USD",
      currencyDisplay,
      minimumFractionDigits: 0
    });
  };

  let formatter = newFormatter();

  const getCurrency = (formatter: Intl.NumberFormat) => {
    return formatter
      .formatToParts(0)
      .filter((part) => part.type === "currency")
      .map((part) => part.value)
      .join("");
  };

  return {
    formatRawPrice: (
      amount: number,
      providedCurrency: string | undefined = undefined,
      currencyDisplay: "name" | "symbol" = "name"
    ) => {
      return newFormatter(providedCurrency, currencyDisplay ?? "name").format(amount ?? 0);
    },
    formatRawPriceWithoutCurrency: (amount: number) => {
      return formatter
        .formatToParts(amount ?? 0)
        .filter((part) => part.type !== "currency")
        .map((part) => part.value)
        .join("");
    },
    formatPlainPrice: (amount: number | string) => {
      const value = Number(amount);
      if (isNaN(value)) {
        return 0;
      }
      return value ? value / 100 : 0;
    },
    formatPrice: (
      amount: number,
      providedCurrency: string | undefined = undefined,
      currencyDisplay: "name" | "symbol" = "name"
    ) => {
      return newFormatter(providedCurrency, currencyDisplay ?? "name").format(amount ? amount / 100 : 0);
    },
    formatPriceWithoutCurrency: (amount: number) =>
      formatter
        .formatToParts(amount ? amount / 100 : 0)
        .filter((part) => part.type !== "currency")
        .map((part) => part.value)
        .join(""),
    currentCurrency: getCurrency(formatter),
    currentCurrencySymbol: getCurrency(newFormatter(undefined, "symbol")),
    currentCurrencyLocalizeSymbol: getCurrency(newFormatter(undefined, "symbol", "ar")).substring(0, 3),
    formatCurrency: (providedCurrency: string | undefined = undefined) => {
      let formatter = newFormatter(providedCurrency);

      return getCurrency(formatter);
    },
    setCurrency
  };
};

export const wasEdited = (data: Product | Course | Chapter | Content) => {
  if (!data) {
    return false;
  }

  const createdAt = dayjs(data.created_at);
  const updatedAt = dayjs(data.updated_at);
  return updatedAt.diff(createdAt) > 0;
};

export const durationParser = (value: number | string, type: "seconds" | "minute" | "hour"): number => {
  if (typeof value === "number" || typeof value === "string") {
    const duration = parseInt(value as string);
    if (type === "seconds") {
      return duration;
    }
    if (type === "minute") {
      return duration / 60;
    }
    if (type === "hour") {
      return duration / 3600;
    }
  }
  return 0;
};

export const isSuperAdmin = (user: any) => {
  return user.roles.some((r: any) => ["super-admin"].includes(r.name));
};

export const isCustomizedDomain = (hostname?: string) => {
  let $hostname;
  if (hostname) {
    $hostname = hostname;
  } else {
    $hostname = window.location.hostname;
  }
  return $hostname !== process.env.NEXT_PUBLIC_BASE_APP_URL;
};

export const isDefaultRoleType = (name: string): boolean => {
  return Object.values(RoleTypes).includes(name as RoleTypes);
};
