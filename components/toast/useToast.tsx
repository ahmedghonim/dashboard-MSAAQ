import React, { ReactNode } from "react";

import { toast } from "react-toastify";
import { ToastOptions as DefaultOptions, Id } from "react-toastify/dist/types";

import { UpgradeButton } from "@/components/addon-controller/AddonController";

import { Alert, Icon } from "@msaaqcom/abjad";
import { AlertProps } from "@msaaqcom/abjad/dist/components/alert/Alert";

import UpgradeIcon from "../Icons/solid/UpgradeIcon";

interface ToastOptions
  extends Omit<Omit<DefaultOptions, "closeButton">, "icon">,
    Pick<AlertProps, "actions">,
    Pick<AlertProps, "dismissible">,
    Pick<AlertProps, "title">,
    Pick<AlertProps, "icon">,
    Pick<AlertProps, "variant"> {
  message: string | ReactNode;
}

export function useToast() {
  const setToast = ({
    variant = "success",
    message,
    actions,
    icon,
    title,
    dismissible = true,
    ...props
  }: ToastOptions) => {
    return toast(
      <>
        <Alert
          icon={icon}
          variant={variant}
          title={title}
          children={message}
          actions={actions}
          dismissible={!!dismissible}
        />
      </>,
      props
    );
  };

  setToast.error = ({ variant = "danger", ...props }: ToastOptions) => setToast({ ...props, variant: "danger" });
  setToast.success = ({ variant = "success", ...props }: ToastOptions) => setToast({ ...props, variant: "success" });
  setToast.info = ({ variant = "info", ...props }: ToastOptions) => setToast({ ...props, variant: "info" });
  setToast.warning = ({ variant = "warning", ...props }: ToastOptions) => setToast({ ...props, variant: "warning" });
  setToast.default = ({ variant = "default", ...props }: ToastOptions) => setToast({ ...props, variant: "default" });
  setToast.upgrade = ({ variant = "gradient", ...props }: ToastOptions) =>
    setToast({
      ...props,
      variant: "gradient",
      actions: <UpgradeButton />,
      icon: <Icon children={<UpgradeIcon />} />
    });

  setToast.dismiss = (id?: Id | undefined) => toast.dismiss(id);
  setToast.update = (id: number, options: ToastOptions) => toast.update(id, options);
  setToast.clearWaitingQueue = () => toast.clearWaitingQueue();

  return [setToast];
}
