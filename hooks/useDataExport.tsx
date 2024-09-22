import React from "react";

import { useResponseToastHandler } from "@/hooks/useResponseToastHandler";
import axios from "@/lib/axios";
import { APIActionResponse, AnyObject } from "@/types";

type Props = {
  name: string;
  endpoint: string;
  ids: string[] | number[];
  type?: "xlsx" | "csv";
  payload?: AnyObject;
};

type ReturnType = [(props: Props) => void];

export const useDataExport = (): ReturnType => {
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const handleDataExport = async ({ endpoint, ids, name, payload = {}, type = "xlsx" }: Props) => {
    await axios({
      url: endpoint,
      method: "POST",
      data: {
        ...(ids.length > 0 && { ids }),
        ...payload,
        type
      }
    })
      .then(({ data }) => {
        displaySuccess({
          data
        } as APIActionResponse<any>);
      })
      .catch((error) => {
        if (error.response?.data) {
          displayErrors({
            error: {
              status: error.response.status,
              message: error.response.data.message,
              code: error.response?.data.code
            }
          } as APIActionResponse<any>);
        }
      });
  };

  return [handleDataExport];
};
