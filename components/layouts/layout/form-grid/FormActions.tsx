import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { FormActionsStatus, FormStatusesProps } from "@/components/layouts/layout/form-grid/FormActionsStatus";
import { useConfirmableCancelEdits, wasEdited } from "@/hooks";

import { Button } from "@msaaqcom/abjad";

export interface FormActionsProps extends FormStatusesProps {
  product: any & { id: string | number; updated_at: string; created_at: string };
  redirect: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  saveAndContinue?: boolean;
  customSubmitButtonText?: string;
  cancelCustomText?: string;
}

const FormActions: FC<FormActionsProps> = ({
  product,
  redirect,
  form,
  className,
  size = "lg",
  statuses = [],
  saveAndContinue = true,
  customSubmitButtonText,
  cancelCustomText,
  ...props
}) => {
  const { t } = useTranslation();
  const was_edited = wasEdited(product);
  const {
    formState: { isDirty, isSubmitting }
  } = form;
  const [cancelEdits] = useConfirmableCancelEdits({ isDirty, isSubmitting, redirect });

  return React.createElement(
    className ? "div" : React.Fragment,
    // @ts-ignore
    {
      ...(className ? { className } : {})
    },
    <>
      {statuses.length > 0 && (
        <FormActionsStatus
          statuses={statuses}
          form={form}
          item={product}
          {...props}
        />
      )}

      <Button
        variant="primary"
        size={size}
        type="submit"
        isFetching={product ? !product.id : false}
        disabled={isSubmitting || !isDirty}
        children={
          isSubmitting
            ? t("submitting")
            : was_edited
            ? t(customSubmitButtonText ?? "save_changes")
            : saveAndContinue
            ? t(customSubmitButtonText ?? "save_and_continue")
            : t("save_changes")
        }
      />
      {was_edited ? (
        <Button
          variant="default"
          size={size}
          onClick={cancelEdits}
          disabled={isSubmitting || !isDirty}
          children={t(cancelCustomText ?? "discard_changes")}
        />
      ) : (
        <Button
          as={Link}
          href={redirect}
          variant="default"
          size={size}
          isFetching={product ? !product.id : false}
          children={
            saveAndContinue ? t(cancelCustomText ?? "cancel_and_back") : t(cancelCustomText ?? "discard_changes")
          }
        />
      )}
    </>
  );
};

type FormActionsComponent<P = {}> = FC<P>;
export default FormActions as FormActionsComponent<FormActionsProps>;
