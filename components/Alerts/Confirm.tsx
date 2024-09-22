import React, { ReactNode, useState } from "react";

//@ts-ignore
import { confirmable, createConfirmation } from "react-confirm";

import { classNames } from "@/utils";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Modal } from "@msaaqcom/abjad";
import { AlertProps } from "@msaaqcom/abjad/dist/components/alert/Alert";

interface ConfirmOptions extends Pick<AlertProps, "variant"> {
  title: string;
  children: ReactNode | any;
  okLabel: string;
  cancelLabel?: string;
  proceed: (value: boolean) => void;
  enableConfirmCheckbox?: boolean;
  checkboxLabel?: string;
  show: boolean;
  icon?: ReactNode;
  bgColor?: "warning" | "danger" | "primary" | "success";
}

const generateModalClasses = (variant: "warning" | "danger" | "primary" | "success") => {
  switch (variant) {
    case "warning":
      return "bg-warning-50 border-warning";
    case "danger":
      return "bg-danger-50 border-danger";
    case "success":
      return "bg-success-50 border-success";
    default:
      return "bg-primary-50 border-primary";
  }
};

const Confirmation = ({
  okLabel,
  cancelLabel,
  children,
  title,
  proceed,
  show,
  icon = <ExclamationTriangleIcon />,
  variant,
  bgColor,
  checkboxLabel,
  enableConfirmCheckbox
}: ConfirmOptions) => {
  const [confirm, setConfirm] = useState(false);
  const resolvedChildren =
    typeof children === "string" ? (
      <span
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: children }}
      ></span>
    ) : (
      children
    );
  return (
    <Modal
      open={show}
      className={classNames(bgColor && `${generateModalClasses(bgColor)} border`)}
      onDismiss={() => {
        proceed(false);
      }}
    >
      <Modal.Header className="mb-2 border-0 pb-0">
        <div className="flex w-full items-center">
          <Icon
            className={classNames("ml-4", `text-${variant}`)}
            children={icon}
          />
          <span className="font-semibold">{title}</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Modal.Content className="pr-[3.25rem] pt-0">
          {resolvedChildren}
          {enableConfirmCheckbox && checkboxLabel && (
            <div className="mt-6">
              <Form.Checkbox
                variant={variant}
                id="action-confirmed-checkbox"
                label={checkboxLabel}
                onChange={(e) => {
                  setConfirm(e.target.checked);
                }}
              />
            </div>
          )}
        </Modal.Content>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <div className="flex flex-row pr-[2.25rem]">
          <Button
            variant={variant}
            size={"sm"}
            onClick={() => proceed(true)}
            className="ml-2"
            children={okLabel}
            disabled={enableConfirmCheckbox && !confirm}
          />
          {cancelLabel && (
            <Button
              variant="dismiss"
              size={"sm"}
              onClick={() => proceed(false)}
              children={cancelLabel}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export function confirm(options: Omit<ConfirmOptions, "proceed" | "show">) {
  return createConfirmation(confirmable(Confirmation))(options);
}
