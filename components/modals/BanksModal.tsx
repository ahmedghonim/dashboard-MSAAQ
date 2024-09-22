import React, { FC, Fragment, useCallback, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card } from "@/components";
import CurrenciesSelect from "@/components/select/CurrenciesSelect";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useInstallAppMutation } from "@/store/slices/api/appsSlice";
import { fetchInstalledApps } from "@/store/slices/app-slice";
import { APIActionResponse, App } from "@/types";
import { classNames } from "@/utils";

import { ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button, Collapse, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface InstallAppModalProps extends ModalProps {
  app: App | null;
}

interface Bank {
  account_name: string;
  account_number: string;
  bank_name: string;
  iban: string;
  bic: string;
  currency: {
    label: string;
    value: string;
  } | null;

  defaultOpen: boolean;
}

export type QuizFormInputs = {
  accounts: Array<Bank>;
};
const Bank = {
  account_name: "",
  account_number: "",
  bank_name: "",
  iban: "",
  bic: "",
  currency: null
};
const BankFields: FC<{ control: any; bank: any; index: any; errors: any }> = ({ control, bank, index, errors }) => {
  return (
    <Fragment key={bank.id}>
      <Form.Group
        required
        className="mb-0"
        label="اسم البنك"
        errors={errors.accounts?.[index]?.bank_name?.message}
      >
        <Controller
          render={({ field }) => (
            <Form.Input
              placeholder="مثال: بنك الراجحي"
              {...field}
            />
          )}
          name={`accounts.${index}.bank_name`}
          control={control}
          defaultValue={bank.bank_name}
        />
      </Form.Group>
      <Form.Group
        required
        className="mb-0"
        label="اسم صاحب الحساب البنكي"
        errors={errors.accounts?.[index]?.account_name?.message}
      >
        <Controller
          render={({ field }) => (
            <Form.Input
              placeholder="أدخِل الاسم كما هو في الوثائق الرسمية"
              {...field}
            />
          )}
          name={`accounts.${index}.account_name`}
          control={control}
          defaultValue={bank.account_name}
        />
      </Form.Group>
      <Form.Group
        required
        className="mb-0"
        label="رقم الحساب"
        errors={errors.accounts?.[index]?.account_number?.message}
      >
        <Controller
          render={({ field }) => (
            <Form.Input
              placeholder="أدخِل رقم الحساب البنكي"
              {...field}
            />
          )}
          name={`accounts.${index}.account_number`}
          control={control}
          defaultValue={bank.account_number}
        />
      </Form.Group>
      <Form.Group
        required
        className="mb-0"
        label="عُملِة الحساب"
        errors={errors.accounts?.[index]?.currency?.message}
      >
        <Controller
          render={({ field }) => (
            <CurrenciesSelect
              placeholder="اختر عُملِة حسابك"
              {...field}
            />
          )}
          name={`accounts.${index}.currency`}
          control={control}
          defaultValue={bank.currency}
        />
      </Form.Group>
      <Form.Group
        required
        className="mb-0"
        label="رقم الآيبان IBAN"
        errors={errors.accounts?.[index]?.iban?.message}
      >
        <Controller
          render={({ field }) => (
            <Form.Input
              placeholder="رقم الآيبان IBAN"
              {...field}
            />
          )}
          name={`accounts.${index}.iban`}
          control={control}
          defaultValue={bank.iban}
        />
      </Form.Group>
      <Form.Group
        required
        className="mb-0"
        label="رقم السويفت SWIFT"
        errors={errors.accounts?.[index]?.bic?.message}
      >
        <Controller
          render={({ field }) => (
            <Form.Input
              placeholder="رمز تعريف البنك الدولي الخاص بك"
              {...field}
            />
          )}
          name={`accounts.${index}.bic`}
          control={control}
          defaultValue={bank.bic}
        />
      </Form.Group>
    </Fragment>
  );
};
const BanksModal: FC<InstallAppModalProps> = ({ open, onDismiss, className, app }) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);
  const [installAppMutation] = useInstallAppMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const schema = yup.object().shape({
    accounts: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            account_name: yup.string().required(),
            account_number: yup.string().required(),
            bank_name: yup.string().required(),
            iban: yup.string().required(),
            bic: yup.string().required(),
            currency: yup
              .object()
              .shape({
                label: yup.string().required(),
                value: yup.string().required()
              })
              .required()
          })
          .required()
      )
      .min(1)
      .required()
  });

  const form = useForm<QuizFormInputs>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    control,
    setError,
    getValues,
    reset,
    watch
  } = form;

  const {
    fields: banks,
    append: appendBank,
    remove: removeBank,
    update: updateBank
  } = useFieldArray({
    name: "accounts",
    control
  });

  useEffect(() => {
    if (app?.fields?.[0].items?.length) {
      reset({
        accounts: app.fields[0].items.map((item) => ({
          account_name: item.account_name,
          account_number: item.account_number,
          bank_name: item.bank_name,
          iban: item.iban,
          bic: item.bic,
          currency: {
            label: item.currency,
            value: item.currency
          },
          id: item.id
        }))
      });
    }
  }, [app]);
  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const closeAllAccounts = useCallback(() => {
    getValues("accounts").map((account, index) => {
      updateBank(index, { ...account, defaultOpen: false });
    });
  }, []);

  const onSubmit: SubmitHandler<QuizFormInputs> = async (data) => {
    if (isSubmitting || !app || !isValid) return;

    const installed = (await installAppMutation({
      id: app.id,
      accounts: data.accounts.map((bank) => ({
        ...bank,
        currency: bank.currency?.value
      }))
    })) as APIActionResponse<App>;

    if (displayErrors(installed)) return;

    displaySuccess(installed);
    dispatch(fetchInstalledApps());

    setShow(false);
    onDismiss?.();
  };

  return app ? (
    <Modal
      size="xl"
      open={show}
      onDismiss={onDismiss}
      className={className}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={"إضافة حساب بنكي"} />
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="space-y-4">
            <Card className="bg-gray-100">
              <Card.Body className="flex flex-col gap-y-6">
                <div className="flex items-center justify-between">
                  {app.icon && (
                    <img
                      src={app.icon.url}
                      alt={app.title}
                      width={45}
                      height={45}
                    />
                  )}
                </div>
                <Typography.Paragraph
                  as={"h3"}
                  weight="medium"
                  size="md"
                  children={app.title}
                />
                <Typography.Paragraph
                  className="text-gray-700"
                  children={app.description}
                />
              </Card.Body>
            </Card>
            <Typography.Paragraph
              as={"h3"}
              weight="medium"
              children="تفاصيل البنك"
            />
            {!app?.fields?.[0].items?.length ? (
              <>
                {banks.length ? (
                  <div className="grid grid-cols-2 gap-4">
                    {banks.map((bank, index) => (
                      <BankFields
                        key={bank.id}
                        errors={errors}
                        control={control}
                        bank={bank}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-500 flex items-center justify-center rounded-md border bg-primary-50 px-4 py-6">
                    <Button
                      ghost
                      onClick={() => {
                        closeAllAccounts();
                        appendBank({
                          ...Bank,
                          defaultOpen: true
                        });
                      }}
                    >
                      أضِف حساب بنكي
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {banks.map((bank, index) => (
                  <Collapse
                    key={bank.id}
                    defaultOpen={bank.defaultOpen}
                  >
                    {({ toggle, isOpen }) => (
                      <>
                        <Collapse.Button
                          append={
                            <>
                              <div className="flex gap-x-2">
                                {banks.length > 1 && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    icon={
                                      <Icon size="sm">
                                        <TrashIcon />
                                      </Icon>
                                    }
                                    onClick={() => removeBank(index)}
                                  />
                                )}
                                <Button
                                  variant="default"
                                  ghost
                                  size="sm"
                                  onClick={toggle}
                                  icon={
                                    <Icon
                                      className={`${
                                        isOpen ? "rotate-180 transform" : ""
                                      } transition-all duration-300 ease-in-out`}
                                    >
                                      <ChevronUpIcon />
                                    </Icon>
                                  }
                                />
                              </div>
                            </>
                          }
                          className={classNames("border-gray py-6", !isOpen && "border", isOpen && "border-x border-t")}
                        >
                          <Typography.Paragraph
                            as="span"
                            size="md"
                            weight="medium"
                          >
                            {watch(`accounts.${index}.bank_name`)}
                          </Typography.Paragraph>
                        </Collapse.Button>
                        <Collapse.Content className="border-x border-b border-gray px-4 pb-4">
                          <div className="flex flex-col space-y-4">
                            <BankFields
                              key={bank.id}
                              errors={errors}
                              control={control}
                              bank={bank}
                              index={index}
                            />
                          </div>
                        </Collapse.Content>
                      </>
                    )}
                  </Collapse>
                ))}
                <Button
                  className="mx-auto"
                  onClick={() => {
                    closeAllAccounts();
                    appendBank({
                      ...Bank,
                      bank_name: "عنوان افتراضي",
                      defaultOpen: true
                    });
                  }}
                  variant="default"
                  children="إضافة حساب بنكي آخر"
                />
              </>
            )}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="gap-x-2">
          <Button
            size="lg"
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            children={"إضافة الحساب"}
          />
          <Button
            variant="dismiss"
            size="lg"
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  ) : null;
};

export default BanksModal;
