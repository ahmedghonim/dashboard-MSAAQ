import Axios from "axios";
import { getCookie } from "cookies-next";

const $axios = Axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});
const axios = Axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});

axios.interceptors.request.use(
  (config: any) => {
    const locale = getCookie("current_locale") ?? "ar";
    config.headers["Accept-Language"] = locale;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: any) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const setCurrentAcademyId = (academyId: any) => {
  if (academyId) {
    axios.defaults.headers.common["X-Academy-ID"] = academyId;
  } else {
    delete axios.defaults.headers.common["X-Academy-ID"];
  }
};
export const setAcceptLanguage = (locale: string) => {
  if (locale) {
    axios.defaults.headers.common["Accept-Language"] = locale;
  } else {
    axios.defaults.headers.common["Accept-Language"] = "ar";
  }
};

export const setReferredBy = (id: string) => {
  if (id) {
    axios.defaults.headers.common["X-Referred-By"] = id;
  } else {
    delete axios.defaults.headers.common["X-Referred-By"];
  }
};
export const setXAcademyDomain = (domain: string) => {
  if (domain) {
    axios.defaults.headers.common["X-Academy-Domain"] = domain;
  } else {
    delete axios.defaults.headers.common["X-Academy-Domain"];
  }
};

export { $axios, axios };
