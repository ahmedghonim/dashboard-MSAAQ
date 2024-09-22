import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";

import { axios } from "./axios";

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, headers, data, params }) => {
    try {
      const result = await axios({ url: url, headers, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      let { response, ...err } = axiosError as AxiosError;
      return {
        error: {
          status: response?.status,
          ...(response?.data ?? { message: err.message })
        }
      };
    }
  };

export default axiosBaseQuery;
