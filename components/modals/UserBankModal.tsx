import { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { find } from "lodash";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import CurrenciesSelect from "@/components/select/CurrenciesSelect";
import { useAppSelector, useResponseToastHandler } from "@/hooks";
import {
  useCreateUserBankMutation,
  useFetchUserBankQuery,
  useUpdateUserBankMutation
} from "@/store/slices/api/bankSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIActionResponse, Bank } from "@/types";

import { Button, Form, Modal, ModalProps } from "@msaaqcom/abjad";

interface Props extends ModalProps {
  onToggleBankModal: (show: boolean) => void;
  onBankDataChange: (data: Bank) => void;
}

const UserBankModal: React.FC<Props> = ({ open, onToggleBankModal, onBankDataChange, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const { user } = auth;
  const { data } = useFetchUserBankQuery({ user_id: user.id });

  const userBank = data?.data as Bank | undefined;
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const handleCloseBankModal = () => {
    onToggleBankModal(false);
  };
  const handleBankDataChange = (data: Bank) => {
    onBankDataChange(data);
  };

  const schema = yup
    .object({
      account_name: yup.string().required(),
      account_number: yup.string().required(),
      bank_name: yup.string().required(),
      iban: yup.string().required(),
      bic: yup.string().required(),
      currency: yup.object().required()
    })
    .required();
  const {
    control: control,
    handleSubmit: handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset
  } = useForm<Bank>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const { currencies } = useAppSelector<AppSliceStateType>((state) => state.app);
  const currency = find(currencies, (el) => {
    const currencyCode = (userBank?.currency as string)?.toLowerCase();
    return currencyCode === el.code.toLowerCase();
  });

  useEffect(() => {
    if (userBank && currencies.length) {
      reset({
        account_name: userBank?.account_name,
        account_number: userBank?.account_number,
        bank_name: userBank?.bank_name,
        iban: userBank?.iban,
        bic: userBank?.bic,
        currency: {
          ...currency,
          label: currency?.name,
          value: currency?.code
        }
      });
    }
  }, [userBank, currencies]);

  const [createBank] = useCreateUserBankMutation();
  const [updateBank] = useUpdateUserBankMutation();

  const onSubmit: SubmitHandler<Bank> = async (data) => {
    const currencyValue = typeof data?.currency === "string" ? data?.currency : data?.currency.value;

    const response = userBank
      ? ((await updateBank({
          ...data,
          currency: currencyValue
        })) as APIActionResponse<Bank>)
      : ((await createBank({
          ...data,
          currency: currencyValue
        })) as APIActionResponse<Bank>);

    if (response.error) {
      displayErrors(response);
      return;
    }
    displaySuccess(response);
    setShow(false);
    handleBankDataChange(data);
    handleCloseBankModal();
  };

  return (
    <>
      <Modal
        size="xl"
        open={show}
        onDismiss={() => {
          props.onDismiss?.();
          handleCloseBankModal();
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{userBank ? t("affiliates.update_bank") : t("affiliates.add_bank")}</Modal.HeaderTitle>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Modal.Content className="!pb-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.bank_name")}
                  errors={errors.bank_name?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("affiliates.bank_name_placeholder")}
                        {...field}
                      />
                    )}
                    name={`bank_name`}
                    control={control}
                    defaultValue={userBank?.bank_name}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.account_name")}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("affiliates.account_name_placeholder")}
                        {...field}
                      />
                    )}
                    name={`account_name`}
                    control={control}
                    defaultValue={userBank?.account_name}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.account_number")}
                  errors={errors.account_number?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("affiliates.account_number_placeholder")}
                        {...field}
                      />
                    )}
                    name={`account_number`}
                    control={control}
                    defaultValue={userBank?.account_number}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.currency")}
                  errors={errors.currency?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <CurrenciesSelect
                        placeholder={t("affiliates.currency_placeholder")}
                        {...field}
                      />
                    )}
                    name={`currency`}
                    control={control}
                    defaultValue={userBank?.currency}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.iban")}
                  errors={errors.iban?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("affiliates.iban_placeholder")}
                        {...field}
                      />
                    )}
                    name={`iban`}
                    control={control}
                    defaultValue={userBank?.iban}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("affiliates.bic")}
                  errors={errors.bic?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("affiliates.bic_placeholder")}
                        {...field}
                      />
                    )}
                    name={`bic`}
                    control={control}
                    defaultValue={userBank?.bic}
                  />
                </Form.Group>
              </div>
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="lg"
              className="ml-2"
              type="submit"
              children={userBank ? t("affiliates.update_bank") : t("affiliates.add_bank")}
              disabled={!isValid || !isDirty || isSubmitting}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              children={t("cancel")}
              onClick={() => {
                setShow(false);
                handleCloseBankModal();
              }}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
export default UserBankModal;
