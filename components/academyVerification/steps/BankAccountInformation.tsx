import React, { FC } from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { StepProps } from "@/components/academyVerification";
import CurrenciesSelect from "@/components/select/CurrenciesSelect";

import { Form } from "@msaaqcom/abjad";

const BankAccountInformation: FC<StepProps> = ({ control, errors }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="my-10 flex flex-col gap-y-6">
        <Form.Group
          required
          label={t("academy_verification.account_name")}
          errors={errors.bank?.account_name?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.account_name_placeholder")}
                {...field}
              />
            )}
            name={"bank.account_name"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.bank_name")}
          errors={errors.bank?.bank_name?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.bank_name_placeholder")}
                {...field}
              />
            )}
            name={"bank.bank_name"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.account_number")}
          errors={errors.bank?.account_number?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.account_number_placeholder")}
                {...field}
              />
            )}
            name={"bank.account_number"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.currency")}
          help={t("academy_verification.currency_help")}
          errors={errors.bank?.currency?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <CurrenciesSelect
                placeholder={t("academy_verification.currency_placeholder")}
                {...field}
              />
            )}
            name={"bank.currency"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.iban")}
          errors={errors.bank?.iban?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.iban_placeholder")}
                {...field}
              />
            )}
            name={"bank.iban"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          label={t("academy_verification.bic")}
          errors={errors.bank?.bic?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.bic_placeholder")}
                {...field}
              />
            )}
            name={"bank.bic"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          label={t("academy_verification.iban_image")}
          className="mb-0"
          errors={errors.bank?.iban_certificate_image?.message}
          required
        >
          <Controller
            render={({ field }) => (
              <Form.File
                accept={["image/*", "application/pdf"]}
                maxFiles={1}
                {...field}
              />
            )}
            name={"bank.iban_certificate_image"}
            control={control}
          />
        </Form.Group>
      </div>
    </>
  );
};
export default BankAccountInformation;
