import { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Price } from "@/components";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useCreateAffiliatePayoutMutation } from "@/store/slices/api/msaaq-affiliates/payoutsSlice";
import { APIActionResponse, Bank, PayoutSettings } from "@/types";
import { MsaaqAffiliateSettings } from "@/types/models/msaaqAffiliateSettings";
import { middleTruncate } from "@/utils";

import { BanknotesIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface PayoutRequestForm {
  withdraw: string;
  amount: number;
}

interface Props extends ModalProps {
  affiliateSettings: MsaaqAffiliateSettings;
  onToggleBankModal: (show: boolean) => void;
  userBank: Bank | undefined;
}

const MsaaqAffiliatePayoutModal: React.FC<Props> = ({
  open,
  affiliateSettings,
  userBank,
  onToggleBankModal,
  ...props
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const { formatPrice } = useFormatPrice();
  const [createPayoutMutation] = useCreateAffiliatePayoutMutation();

  const handleOpenBankModal = () => {
    onToggleBankModal(true);
  };

  const schema = yup
    .object({
      amount: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .min(
          affiliateSettings?.setting?.payouts_min_amount,
          t("validation.min_payout_amount", {
            amount: affiliateSettings?.setting?.payouts_min_amount
              ? formatPrice(affiliateSettings.setting.payouts_min_amount * 100, "USD")
              : formatPrice(0, "USD")
          })
        )
        .max(affiliateSettings?.balance?.available_balance / 100, t("validation.max_payout_amount"))
        .required()
    })
    .required();

  const {
    control: control,
    handleSubmit: handleSubmit,
    setValue: setValue,
    formState: { errors, isValid, isDirty, isSubmitting }
  } = useForm<PayoutRequestForm>({
    defaultValues: {
      amount: 0
    },
    mode: "all",
    resolver: yupResolver(schema)
  });
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const onSubmit: SubmitHandler<PayoutRequestForm> = async (data) => {
    const response = (await createPayoutMutation(data.amount)) as APIActionResponse<PayoutSettings>;

    if (response.error) {
      displayErrors(response);
      return;
    }
    displaySuccess(response);
    props.onDismiss?.();
    setValue("amount", 0);
  };

  return (
    <>
      <Modal
        size="lg"
        open={show}
        onDismiss={() => {
          props.onDismiss?.();
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("affiliates.earnings_withdrawal")}</Modal.HeaderTitle>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <div className="flex items-center justify-between gap-4 bg-gray-50 p-4">
              <Typography.Paragraph>{t("affiliates.withdrawable_affiliates")}</Typography.Paragraph>
              <Typography.Paragraph
                size="md"
                weight="medium"
                className="mr-auto text-black"
                children={
                  <Price
                    price={affiliateSettings?.balance.available_balance ?? 0}
                    currency={"USD"}
                  />
                }
              />
            </div>
            <Modal.Content>
              <Form.Group
                className="p-0"
                label={t("affiliates.insert_amount")}
                errors={errors.amount?.message}
              >
                <Controller
                  name={"amount"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Number
                      min={1}
                      value={value}
                      suffix={t("affiliates.payout_currency")}
                      placeholder={"0"}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Typography.Paragraph
                className="mb-2"
                weight="medium"
                size="md"
                children={t("affiliates.earnings_will_be_transferred_to_your_account")}
              />
              <Card>
                <Card.Body>
                  {userBank ? (
                    <div className="mb-8 flex items-center gap-48">
                      <div className="flex flex-col">
                        <Typography.Paragraph
                          size="md"
                          weight="medium"
                          className="text-black"
                          children={t("affiliates.bank_name")}
                        />
                        <div className="flex gap-2">
                          <Icon
                            size="md"
                            children={<BanknotesIcon />}
                          />
                          <Typography.Paragraph
                            size="sm"
                            weight="medium"
                            className="text-black"
                            children={userBank.bank_name}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <Typography.Paragraph
                          size="md"
                          weight="medium"
                          className="text-black"
                          children={t("affiliates.bank_number")}
                        />
                        <Typography.Paragraph
                          size="sm"
                          weight="medium"
                          className="text-black"
                          children={middleTruncate(String(userBank?.account_number), 2, 4, "****")}
                        />
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <Button
                    variant={"default"}
                    className="w-full"
                    onClick={() => {
                      handleOpenBankModal();
                    }}
                    children={userBank ? t("affiliates.change_bank_account") : t("affiliates.add_bank")}
                  />
                </Card.Body>
              </Card>
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="lg"
              className="ml-2"
              type="submit"
              children={t("affiliates.withdraw")}
              disabled={!isValid || !isDirty || isSubmitting}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              children={t("cancel")}
              onClick={() => {
                props.onDismiss?.();
              }}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
export default MsaaqAffiliatePayoutModal;
