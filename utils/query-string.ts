// @ts-ignore
import deParam from "can-deparam";

export const parseQueryString = (input: string | URL) => {
  let queryString = "";
  if (typeof input === "string") {
    const split = input.split("?");
    queryString = split.length > 1 ? split[1] : split[0];
  } else if (input instanceof URL) {
    queryString = input.search.slice(1);
  } else {
    throw new Error("Invalid input: expected a string or URL object");
  }

  return deParam(queryString);
};

export const objectToQueryString = (initialObj: any) => {
  const reducer =
    (obj: any, parentPrefix = null) =>
    (prev: any, key: any) => {
      const val = obj[key];
      key = encodeURIComponent(key);
      const prefix = parentPrefix ? `${parentPrefix}[${key}]` : key;

      if (val == null || typeof val === "function") {
        prev.push(`${prefix}=`);
        return prev;
      }

      if (["number", "boolean", "string"].includes(typeof val)) {
        prev.push(`${prefix}=${encodeURIComponent(val)}`);
        return prev;
      }

      prev.push(Object.keys(val).reduce(reducer(val, prefix), []).join("&"));
      return prev;
    };

  return Object.keys(initialObj).reduce(reducer(initialObj), []).join("&");
};
