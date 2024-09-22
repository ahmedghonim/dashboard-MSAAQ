import { isObject } from "lodash";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { UseFormSetError } from "react-hook-form/dist/types/form";

import { useToast } from "@/components/toast";
import { APIActionResponse, BREAKPOINTS, ErrorCodes } from "@/types";

import { useMediaQuery } from "./useMediaQuery";

interface ReturnType {
  display: (response: APIActionResponse<any>) => void;
  displayErrors: (response: APIActionResponse<any>) => boolean;
  displaySuccess: (response: APIActionResponse<any>) => boolean;
}

type Props = {
  setError?: UseFormSetError<any>;
};

export const useResponseToastHandler = ({ setError }: Props): ReturnType => {
  const [toast] = useToast();
  const { t } = useTranslation();
  const isXS = useMediaQuery(BREAKPOINTS.xs);
  const displayErrors = (response: APIActionResponse<any>): boolean => {
    if (!response.error) {
      return false;
    }

    if (!isEmpty(response.error?.code)) {
      switch (response.error.code) {
        case ErrorCodes.ADDON_USAGE_EXCEEDED:
        case ErrorCodes.ADDON_NOT_AVAILABLE:
          toast.upgrade({
            ...(isXS && { position: "bottom-center" }),
            className: "m-2",
            title: t(`upgrade_alerts.${response.error.code.toLowerCase()}.title`),
            message: t(`upgrade_alerts.${response.error.code.toLowerCase()}.message`)
          });

          return true;

        case ErrorCodes.EMAIL_NOT_VERIFIED:
          toast.warning({
            ...(isXS && { position: "bottom-center" }),
            className: "m-2",
            message: response.error.message
          });
          return true;
      }
    }

    if (!response.error?.errors) {
      toast.error({
        ...(isXS && { position: "bottom-center" }),
        className: "m-2",
        message: isObject(response.error.message)
          ? Object.values(response.error.message).join(", ")
          : response.error.message
      });

      return true;
    }

    Object.keys(response.error.errors).forEach((key) => {
      response.error?.errors[key].forEach((message: string) => {
        if (response.error?.status === 422) {
          setError?.(key, { message, type: "manual" });
        }

        toast.error({
          message,
          ...(isXS && { position: "bottom-center" }),
          className: "m-2"
        });
      });
    });

    return true;
  };

  const displaySuccess = (response: APIActionResponse<any>): boolean => {
    const { data } = response;
    if (!data?.message) {
      return false;
    }

    toast.success({
      message: data.message.body,
      title: data.message.title,
      ...(isXS && { position: "bottom-center" }),
      className: "m-2"
    });

    return true;
  };

  const display = (response: APIActionResponse<any>) => {
    displayErrors(response);
    displaySuccess(response);
  };

  return {
    display,
    displayErrors,
    displaySuccess
  };
};
