import { useCallback, useMemo, useState } from "react";

import axios from "axios";
import { ConfigType } from "dayjs";

import { $axios } from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import { Course, Product, ProductModelType } from "@/types";

export * from "./cache";
export * from "./countries";
export { createRange } from "./createRange";
export { classNames, CSS, toClassName, toCssVar } from "./css";
export * from "./getMissingFileIds";
export * from "./humanFileSize";
export * from "./object";
export * from "./parsers";
export * from "./query-string";
export * from "./StringHelper";
export * from "./time";
export * from "./uuid";

export function selectOnClick(event: any) {
  window.getSelection()?.selectAllChildren(event.currentTarget);
}

export function getWildcardCookiePath() {
  const { host, hostname } = window.location;
  if (host.split(".").length === 1) {
    return hostname;
  } else {
    let domainParts = host.split(".");
    domainParts.shift();

    return domainParts.slice(-2).join(".");
  }
}

export function slugify(input: string): string {
  if (!input) {
    return "";
  }

  return input
    .normalize("NFC")
    .replace(/[^\w\u0600-\u06FF]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function convertPrice(price: number | null | undefined): number {
  return price === null || price === undefined ? 0 : price / 100;
}

export const getStatusColor = (status: string) => {
  const colors: any = {
    draft: "default",
    accepted: "success",
    unlisted: "purple",
    published: "success",
    rejected: "danger",
    queued: "warning",
    processing: "info",
    ready: "success",
    open: "danger",
    failed: "danger",
    cancelled: "danger",
    declined: "danger",
    past_due: "warning",
    paused: "danger",
    deleted: "danger",
    incomplete: "danger",
    completed: "success",
    approved: "success",
    paid: "success",
    refunded: "purple",
    pending: "orange",
    success: "success",
    transfer: "purple",
    fully_refunded: "default",
    partially_refunded: "default",
    active: "success",
    trialing: "purple",
    upcoming: "info",
    ended: "success",
    live: "purple",
    course_category: "default",
    product_category: "success",
    scheduled: "purple",
    sent: "success",
    invalid: "danger",
    bounced: "danger"
  };

  return colors[status as string] ?? "default";
};

export const firstName = (name: string = "") => {
  return name.split(" ")[0]?.trim();
};

export function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function truncateString(str: string, length: number, suffix: string = "..."): string {
  const suffixLength = suffix.length;
  return str.length > length ? str.slice(0, length - suffixLength) + suffix : str;
}

export const getProductType = (product: Product | Course): ProductModelType => {
  if (product.hasOwnProperty("instructors") || product.hasOwnProperty("certification")) {
    return ProductModelType.COURSE;
  }
  return ProductModelType.PRODUCT;
};

export const middleTruncate = (str: string, start: number = 20, end: number = 10, separator: string = "...") => {
  if (str.length <= start) {
    return str;
  }

  return str.substring(0, start) + separator + str.substring(str.length - end, str.length);
};

export const formatDate = (date: string, format?: string) => {
  //used @ts-ignore on `fromNow` because it's not in dayjs default types
  //it's custom-made helper function
  //@ts-ignore
  return format ? dayjs(date).format(format) : dayjs(date).fromNow();
};

export const getHexFromColorThemeValue = (colorThemeValue: "purple" | "orange"): string => {
  const colors = {
    purple: "#9D76ED",
    orange: "#ED702D"
  };
  return colors[colorThemeValue];
};

export const calculateSalesPercentage = (current_sales: number, last_sales: number) => {
  const percentage = ((current_sales - last_sales) / last_sales) * 100;
  return isNaN(percentage) || !isFinite(percentage) ? 0 : percentage;
};

interface IOption {
  label: number | string;
  value: number | string;
}
const INCREMENT = 15;
export const useOptions = () => {
  const [filteredOptions, setFilteredOptions] = useState<IOption[]>([]);

  const options = useMemo(() => {
    const end = dayjs().endOf("day");
    const options: IOption[] = [];
    for (
      let t = dayjs().startOf("day");
      t.isBefore(end);
      t = t.add(INCREMENT + (!t.add(INCREMENT).isSame(t, "day") ? -1 : 0), "minutes")
    ) {
      options.push({
        value: t.toDate().valueOf(),
        label: dayjs(t).format("h:mmA")
      });
    }
    options.push({
      value: 1697921940000,
      label: dayjs(end).format("h:mmA")
    });
    return options;
  }, []);

  const filter = useCallback(
    ({ offset, limit, current }: { offset?: ConfigType; limit?: ConfigType; current?: ConfigType }) => {
      if (current) {
        const currentOption = options.find((option) => option.value === dayjs(current).toDate().valueOf());
        if (currentOption) setFilteredOptions([currentOption]);
      } else
        setFilteredOptions(
          options.filter((option) => {
            const time = dayjs(option.value);
            return (!limit || time.isBefore(limit)) && (!offset || time.isAfter(offset));
          })
        );
    },
    [options]
  );

  return { options: filteredOptions, filter };
};

export const toEnglishDigits = (str: string): string => {
  const persianNumbers: RegExp[] = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers: RegExp[] = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

  for (let i = 0; i < 10; i++) {
    str = str.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString());
  }

  return str;
};

export const isEnglish = (value: string): boolean => {
  const regExp: RegExp = /^[A-Za-z0-9]*$/;

  return regExp.test(value);
};

export const isNumeric = (value: string): boolean => {
  const regExp: RegExp = /^[0-9]*$/;

  return regExp.test(value);
};

export const fetchAccessToken = async () => {
  let accessToken = null;
  const getAccessToken = await $axios.post("/oauth/token", {
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET
  });
  if (getAccessToken.data.status) {
    accessToken = getAccessToken.data.data.access_token;
  }
  return accessToken;
};

export const fetchTenant = async ({ accessToken, tenantUrl }: { accessToken: string; tenantUrl: string }) => {
  let tenant = null;
  try {
    const getTenant = await axios.get("", {
      baseURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/tenant`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Academy-Domain": tenantUrl
      }
    });

    if (getTenant) {
      tenant = getTenant.data;
    }
  } catch (error) {}
  return tenant;
};
