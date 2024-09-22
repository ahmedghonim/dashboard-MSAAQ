import React, { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import { confirm } from "@/components/Alerts/Confirm";
import { useResponseToastHandler } from "@/hooks/useResponseToastHandler";

import { Typography } from "@msaaqcom/abjad";

type Props = {
  children?: ReactNode | any;
  id: string | number;
  payload?: object;
  title: string;
  label?: string;
  okLabel?: string;
  callback?: () => void;
};

type ReturnType = [(props: Props) => void];

type HookProps = {
  mutation: any;
};

export const useConfirmableDelete = ({ mutation }: HookProps): ReturnType => {
  const { t } = useTranslation();
  const { display } = useResponseToastHandler({});

  const [deleteMutation] = mutation();

  const handleDelete = async ({ title, label, okLabel, id, callback, children, payload = {} }: Props) => {
    if (
      !(await confirm({
        variant: "danger",
        okLabel: okLabel ? okLabel : t("confirm_delete"),
        cancelLabel: t("cancel"),
        title,
        enableConfirmCheckbox: !!label,
        checkboxLabel: label,
        children:
          children?.type === React.Fragment ? (
            children
          ) : (
            <Typography.Paragraph
              size="md"
              weight="normal"
              children={<span dangerouslySetInnerHTML={{ __html: children }} />}
            />
          )
      }))
    ) {
      return;
    }

    const response = await deleteMutation({ id, ...payload });

    display(response);

    if (response.error) {
      return;
    }

    callback?.();
  };

  return [handleDelete];
};
