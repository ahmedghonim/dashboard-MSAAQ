import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { FC } from "preact/compat";

import { Card, Layout, Time } from "@/components";
import ActivateMsaaqPayCard from "@/components/cards/ActivateMsaaqPayCard";
import { useToast } from "@/components/toast";
import { AuthContext, FreshchatContext } from "@/contextes";
import { useAppDispatch, useAppSelector, useCopyToClipboard, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchEntityQuery } from "@/store/slices/api/entitySlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { AppSliceStateType, fetchAcademyVerificationStatus } from "@/store/slices/app-slice";
import { APIActionResponse, EntitySection, Plans } from "@/types";
import { classNames, stripHtmlTags } from "@/utils";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  XCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { ArrowDownCircleIcon, ArrowPathIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

import { Alert, Button, Form, Icon, Modal, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

const NelcStatus = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const { current_academy } = useContext(AuthContext);
  const { data: entity, isLoading } = useFetchEntityQuery();

  const isApplicable = useMemo(() => {
    return (
      current_academy?.subscription?.plan?.slug == Plans.PRO &&
      current_academy?.subscription?.price?.interval == "yearly"
    );
  }, [current_academy]);

  const isApplicableEntity = useMemo(() => {
    return entity?.data && entity?.data?.type !== "individual";
  }, [entity]);

  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);
  const isNelcInstalled = useMemo(() => installedApps.find((app) => app.slug === "nelc"), [installedApps]);
  const [showEula, setShowEula] = useState<boolean>(false);
  const router = useRouter();
  const [toast] = useToast();

  const [eulaList, setEulaList] = useState<
    | {
        label: string;
        checked: boolean;
      }[]
    | null
  >(null);

  const [copy, values] = useCopyToClipboard();

  useEffect(() => {
    const apiUrl = "https://forward.msaaq.com/api/nelc/terms-and-conditions";

    axios
      .get(apiUrl, {
        headers: {
          "X-Access-Token": process.env.NEXT_PUBLIC_FORWARD_ACCESS_TOKEN
        }
      })
      .then((response) => {
        setEulaList(
          response.data.data.list.map((item: any) => ({
            label: stripHtmlTags(item.text),
            checked: false
          }))
        );
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (router?.query?.error) {
      toast.error({
        message: router.query.error,
        dismissible: false
      });
    }
  }, [router.query]);

  const { openChat } = useContext(FreshchatContext);

  return (
    <>
      {!isLoading ? (
        entity && entity.data.has_nelc_license ? (
          <Card className="mb-6">
            <Card.Body>
              <div className="mb-4 flex justify-between gap-4 rounded-lg bg-gray-50 p-3">
                <Image
                  className="flex-shrink-0"
                  src={"/images/nelc.svg"}
                  alt={"nelc"}
                  width={104}
                  height={40}
                />
                <Button
                  as={"a"}
                  variant={"default"}
                  children={t("academy_verification.nelc.download_license")}
                  href={entity.data.nelc_license_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  icon={
                    <Icon>
                      <CheckBadgeIcon />
                    </Icon>
                  }
                ></Button>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src={"/images/check-success.gif"}
                  alt={"check-success"}
                  width={80}
                  height={80}
                />
                <Typography.Paragraph
                  size="lg"
                  className="text-success"
                  weight="bold"
                  children="تهانينا! تمّ ترخيص منصتك بنجاح 🎉"
                />
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex w-full flex-col rounded-md bg-gray-50 p-4">
                  <Typography.Paragraph
                    className="text-base !font-bold text-gray-950"
                    children={entity.data.nelc_license_start_date}
                  />
                  <Typography.Paragraph
                    className="text-xs !font-normal text-gray-800"
                    children={t("academy_verification.nelc.nelc_license_issued_date")}
                  />
                </div>
                <div className="flex w-full flex-col rounded-md bg-gray-50 p-4">
                  <Typography.Paragraph
                    className="text-base !font-bold text-gray-950"
                    children={entity.data.nelc_license_end_date}
                  />
                  <Typography.Paragraph
                    className="text-xs !font-normal text-gray-800"
                    children={t("academy_verification.nelc.nelc_license_expiry_date")}
                  />
                </div>
              </div>
              <Card className="mb-4 bg-gray-100">
                <Card.Body>
                  <Form.Group
                    className="mb-0"
                    label={t("academy_verification.nelc.nelc_registration_url")}
                  >
                    <Form.Input
                      readOnly
                      value={entity.data.nelc_license_number ?? ""}
                      dir="ltr"
                      append={
                        <Button
                          ghost
                          variant="default"
                          onClick={() => copy(entity.data.nelc_license_number ?? "")}
                          icon={
                            !values.includes(entity.data.nelc_license_number ?? "") ? (
                              <Icon
                                size="sm"
                                children={<ClipboardDocumentIcon />}
                              />
                            ) : (
                              <Icon
                                size="sm"
                                className="text-success"
                                children={<ClipboardDocumentCheckIcon />}
                              />
                            )
                          }
                        />
                      }
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        ) : entity && entity.data.nelc_order_id ? (
          <div className="mb-6">
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("academy_verification.nelc.academy_verify")}
              className="mb-3"
            />
            <Card>
              <Card.Body>
                {entity.data.nelc_license_response ? (
                  <Alert
                    variant="warning"
                    className="mb-4"
                    title={t("academy_verification.nelc.alert_title")}
                    children={
                      <>
                        <div className="mb-4">{t("academy_verification.nelc.alert_description")}</div>
                        <Button
                          variant={"warning"}
                          size="md"
                          children={t("academy_verification.nelc.contact_support")}
                          onClick={() => openChat()}
                        />
                      </>
                    }
                  />
                ) : (
                  <div className="bg-warning/10 mb-4 flex w-fit items-center gap-4 rounded-lg p-3">
                    <Icon className="spinner">
                      <ArrowPathIcon className="text-warning" />
                    </Icon>
                    <Typography.Paragraph
                      children={t("academy_verification.nelc.processing")}
                      className="text-warning"
                      size="sm"
                      weight="medium"
                    />
                  </div>
                )}
                <div className="mb-4 flex gap-4">
                  <Image
                    className="flex-shrink-0"
                    src={"/images/nelc.svg"}
                    alt={"nelc"}
                    width={104}
                    height={40}
                  />
                  <Typography.Paragraph
                    size="lg"
                    weight="medium"
                    children={t("academy_verification.nelc.nelc_subtitle")}
                  />
                </div>
                {entity.data.nelc_license_response && (
                  <Button
                    variant="primary"
                    size="md"
                    className="mr-auto"
                    children={t("academy_verification.nelc.start_verification")}
                    disabled
                  />
                )}
              </Card.Body>
            </Card>
          </div>
        ) : (
          <div className="mb-6">
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("academy_verification.nelc.academy_verify")}
              className="mb-3"
            />
            <Card>
              <Card.Body>
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                  className="mb-4 text-gray-700"
                  children={t("academy_verification.nelc.title")}
                />
                <div className="mb-4 flex gap-4">
                  <Image
                    className="flex-shrink-0"
                    src={"/images/nelc.svg"}
                    alt={"nelc"}
                    width={104}
                    height={40}
                  />
                  <Typography.Paragraph
                    size="lg"
                    weight="medium"
                    children={t("academy_verification.nelc.nelc_subtitle")}
                  />
                </div>
                <ul className="my-6 flex flex-col gap-2">
                  <li className="flex">
                    <Title
                      prepend={
                        <Icon>
                          {isNelcInstalled && isNelcInstalled.installed ? (
                            <CheckCircleIcon className="text-success" />
                          ) : (
                            <XCircleIcon className="text-danger" />
                          )}
                        </Icon>
                      }
                      title={t("academy_verification.nelc.install_nelc")}
                    />
                  </li>
                  <li className="flex">
                    <Title
                      prepend={
                        <Icon>
                          {status == "approved" && isApplicableEntity ? (
                            <CheckCircleIcon className="text-success" />
                          ) : (
                            <XCircleIcon className="text-danger" />
                          )}
                        </Icon>
                      }
                      title={t("academy_verification.nelc.verify_academy")}
                    />
                  </li>
                  <li className="flex">
                    <Title
                      prepend={
                        <Icon>
                          {isApplicable ? (
                            <CheckCircleIcon className="text-success" />
                          ) : (
                            <XCircleIcon className="text-danger" />
                          )}
                        </Icon>
                      }
                      title={t("academy_verification.nelc.check_eligibility")}
                    />
                  </li>
                </ul>
                {isNelcInstalled && isNelcInstalled.installed ? (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!isApplicable || !isApplicableEntity || status !== "approved"}
                    className="mr-auto"
                    children={t("academy_verification.nelc.start_verification")}
                    onClick={() => setShowEula(true)}
                  />
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    as={Link}
                    className="mr-auto"
                    children={t("academy_verification.nelc.install_nelc")}
                    href={"/apps/nelc"}
                  />
                )}
              </Card.Body>
            </Card>
          </div>
        )
      ) : (
        <LoadingCard />
      )}

      {eulaList && (
        <Modal
          size="xl"
          onDismiss={() => {
            setShowEula(false);
          }}
          open={showEula}
        >
          <Modal.Header className="mb-2">
            <div className="flex w-full items-center">
              <Modal.HeaderTitle>{t("academy_verification.nelc.terms")}</Modal.HeaderTitle>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Modal.Content className="pt-0">
              <div className="flex flex-col gap-8">
                <Form.Checkbox
                  id={`checkbox-all`}
                  name={`checkbox-all`}
                  value={1}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEulaList(eulaList.map((item) => ({ ...item, checked: true })));
                    } else {
                      setEulaList(eulaList.map((item) => ({ ...item, checked: false })));
                    }
                  }}
                  label={
                    <Typography.Paragraph
                      className="!text-sm"
                      weight="normal"
                      children={t("academy_verification.nelc.accept_all")}
                    />
                  }
                />
                {eulaList.map((item, index) => {
                  return (
                    <Form.Checkbox
                      id={`checkbox-${index}`}
                      key={index}
                      value={item.checked ? 1 : 0}
                      checked={item.checked}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setEulaList((prevList) => {
                          if (prevList === null) {
                            return null;
                          }
                          return prevList.map((item, $index) =>
                            index === $index ? { ...item, checked: isChecked } : item
                          );
                        });
                      }}
                      name={`checkbox-${index}`}
                      label={
                        <Typography.Paragraph
                          className="!text-sm"
                          weight="normal"
                          children={item.label}
                        />
                      }
                    />
                  );
                })}
              </div>
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full justify-between">
              <Button
                type="submit"
                disabled={!eulaList.every((item) => item.checked === true)}
                children={t("academy_verification.nelc.accept_all_and_procced")}
                onClick={() => {
                  if (eulaList.every((item) => item.checked === true)) {
                    router.push("/settings/verify/nelc");
                  }
                }}
              />

              <Button
                variant="default"
                onClick={() => {
                  setShowEula(false);
                }}
                children={t("cancel")}
              />
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
const StepDone: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="tl-item p-0">
      <div className="tl-dot step-done ml-3 mt-2 p-0">
        <Icon
          children={<CheckCircleIcon />}
          className="relative z-10 h-6 w-6 bg-gray-100 text-success"
        />
      </div>
      <div className="tl-content w-100 p-0">
        <Typography.Paragraph
          as="h3"
          className="text-success"
          weight="bold"
          children={title}
        />
      </div>
    </div>
  );
};
const StepPending: FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  return (
    <div className="tl-item p-0">
      <div className="tl-dot ml-3 mt-2 p-0">
        <Icon
          children={
            <>
              <ArrowDownCircleIcon />
              <span className="absolute inset-0 h-6 w-6 rounded-full border-2 border-gray" />
            </>
          }
          className="relative z-10 h-6 w-6 bg-gray-100 text-secondary"
        />
      </div>
      <div className="tl-content w-full p-0">
        <Card>
          <Card.Body className="flex flex-col gap-y-6">
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("academy_verification.status.verification_status_pending")}
            />
            <Card className="bg-gray-100">
              <Card.Body className="flex justify-center">
                <Typography.Paragraph
                  weight="medium"
                  children={title}
                />
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
const StepRejected: FC<{ title: string; reason: string; step: string }> = ({ title, reason, step }) => {
  const { t } = useTranslation();
  return (
    <div className="tl-item p-0">
      <div className="tl-dot ml-3 mt-2 p-0">
        <Icon
          children={
            <>
              <XCircleIcon />
              <span className="absolute inset-0 h-6 w-6 rounded-full border-2 border-gray" />
            </>
          }
          className="relative z-10 h-6 w-6 bg-gray-100 text-danger"
        />
      </div>
      <div className="tl-content w-full p-0">
        <Card>
          <Card.Body className="flex flex-col gap-y-6 rounded-lg border border-danger">
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("academy_verification.status.complete_your_application")}
            />
            <Card className="bg-gray-100">
              <Card.Body className="flex justify-center">
                <Typography.Paragraph
                  weight="medium"
                  children={reason}
                />
              </Card.Body>
            </Card>
            <div className="flex justify-between">
              <Typography.Paragraph
                size="lg"
                weight="medium"
                children={title}
              />
              <Button
                as={Link}
                href={`/settings/verify?step=${step}`}
                size="sm"
                children={t("academy_verification.status.re-submit_application")}
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
const getStepContent = (section: EntitySection, index: number, t: any) => {
  switch (section.action) {
    case "pending":
    case "submitted":
      return (
        <StepPending
          key={index}
          title={t(`academy_verification.status.${section.section}.${section.action}`)}
        />
      );
    case "declined":
      const step = {
        full_entity: "COUNTRY_AND_ACTIVITY_TYPE",
        id: "IDENTITY_VERIFICATION",
        commercial_register: "ACTIVITY_VERIFICATION",
        bank_account: "BANK_ACCOUNT_INFORMATION"
      }[section.section];
      return (
        <StepRejected
          key={index}
          step={step}
          reason={section.reason as string}
          title={t(`academy_verification.status.${section.section}.${section.action}`)}
        />
      );
    case "approved":
      return (
        <StepDone
          key={index}
          title={t(`academy_verification.status.${section.section}.${section.action}`)}
        />
      );
  }
};
const LoadingCard = () => {
  return (
    <Card className="mx-auto mb-6 w-full">
      <Card.Body>
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 w-full rounded bg-gray md:w-2/4" />
            <div className="grid grid-cols-2 gap-4 rounded bg-gray-100 p-4">
              <div className="flex flex-row items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
            </div>
            <div className="my-10 flex flex-col gap-y-6 lg:flex-row lg:gap-x-6 lg:gap-y-0">
              <div className="flex w-full flex-col">
                <div className="mb-2 h-2 w-full rounded bg-gray" />
                <div className="h-10 w-full rounded bg-gray" />
              </div>
              <div className="flex w-full flex-col">
                <div className="mb-2 h-2 w-full rounded bg-gray" />
                <div className="h-10 w-full rounded bg-gray" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex w-6/12 flex-row items-center gap-x-4">
                <div className="h-5 w-5 rounded bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
              <div className="h-10 w-3/12 rounded bg-gray" />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
export default function Verify() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { entityStatus } = useAppSelector<AppSliceStateType>((state) => state.app);
  const academy = useAppSelector((state) => state.auth.current_academy);

  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();
  const { display } = useResponseToastHandler({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const onSubmit = useCallback(async (data: any) => {
    const updatedAcademy = (await updateAcademySettingsMutation(data)) as APIActionResponse<any>;

    display(updatedAcademy);
    setIsSubmitting(false);
    if (updatedAcademy?.data?.data) {
      dispatch({ type: "auth/setCurrentAcademy", payload: updatedAcademy?.data?.data });
    }
  }, []);

  useEffect(() => {
    if (!entityStatus) {
      dispatch(fetchAcademyVerificationStatus());
    }
  }, [entityStatus]);
  useEffect(() => {
    dispatch(fetchAcademyVerificationStatus());
  }, [academy]);

  const EntityStatus = useCallback(() => {
    if (!entityStatus) {
      return <LoadingCard />;
    } else {
      switch (entityStatus?.action) {
        case "approved":
          return (
            <div>
              <Typography.Paragraph
                size="lg"
                weight="medium"
                children={t("academy_verification.verify_from_msaaq")}
                className="mb-3"
              />
              <Card>
                <Card.Body>
                  <div className="mb-4 flex items-center gap-2">
                    <Image
                      src={"/images/check-success.gif"}
                      alt={"check-success"}
                      width={80}
                      height={80}
                    />
                    <Typography.Paragraph
                      size="lg"
                      className="text-success"
                      weight="bold"
                      children={t("academy_verification.verify_success")}
                    />
                    <Button
                      as={Link}
                      href="/settings/verify"
                      variant="default"
                      size="md"
                      className="mr-auto"
                      children={t("academy_verification.status.verified_alert.action")}
                    />
                  </div>

                  <div className="mt-4 flex flex-col">
                    <Typography.Paragraph
                      size="lg"
                      weight="medium"
                      children={t("academy_verification.features")}
                      className="mb-2"
                    />
                    <ActivateMsaaqPayCard
                      hideImage
                      className="bg-gray-100"
                      canCancel={false}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        default:
          return (
            <>
              <div className="mx-auto mb-10">
                <div className="mb-2 flex flex-col">
                  <Typography.Paragraph
                    size="lg"
                    weight="medium"
                    children={t("academy_verification.status.title")}
                    className={classNames(entityStatus?.action !== "declined" && "mb-2")}
                  />
                  {entityStatus?.action !== "declined" && (
                    <Alert
                      variant="info"
                      children={t("academy_verification.status.will_reply_at")}
                    />
                  )}
                </div>
                <Card>
                  <Card.Body>
                    <Typography.Paragraph
                      className="text-gray-700"
                      weight="medium"
                      children={t("academy_verification.status.verification_status")}
                    />
                    <Typography.Heading
                      as="h1"
                      weight="bold"
                      size="md"
                      className={classNames(entityStatus?.action === "declined" ? "text-danger" : "text-secondary")}
                      children={
                        entityStatus?.action === "declined"
                          ? t("academy_verification.status.verification_status_rejected")
                          : t("academy_verification.status.verification_status_pending")
                      }
                    />
                    {entityStatus?.action === "declined" && (
                      <Typography.Paragraph
                        size="md"
                        weight="medium"
                        children={t("academy_verification.status.verification_status_rejected_description")}
                      />
                    )}
                    <div className="mb-7 mt-4 h-4 w-full rounded-full bg-gray-200">
                      <div
                        className={classNames(
                          "relative h-4 rounded-full transition-all duration-300 ease-in-out",
                          entityStatus?.action === "declined" ? "bg-danger" : "bg-secondary"
                        )}
                        style={{
                          width: entityStatus ? `${entityStatus.progress}%` : "20%"
                        }}
                      >
                        <div
                          className={classNames(
                            "absolute bottom-0 left-0 top-0 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full",
                            entityStatus?.action === "declined" ? "bg-danger" : "bg-secondary"
                          )}
                        >
                          <Icon
                            size="sm"
                            children={entityStatus?.action === "declined" ? <XMarkIcon /> : <ArrowLeftIcon />}
                            className="text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <Title
                      reverse
                      title={<Time date={entityStatus?.created_at ?? ""} />}
                      subtitle={t("academy_verification.status.last_updated")}
                    />
                  </Card.Body>
                </Card>
              </div>
              <div className="mx-auto">
                <StepDone title={t("academy_verification.status.application_submitted")} />
                {entityStatus?.sections.map((section, index) => getStepContent(section, index, t))}
                <div className="tl-item p-0">
                  <div className="tl-dot ml-3 mt-2 p-0">
                    <Icon
                      children={
                        <>
                          <span className="h-5 w-5 rounded-full border-2 border-dashed border-gray-600" />
                        </>
                      }
                      className="relative z-10 h-6 w-6 bg-gray-100"
                    />
                  </div>
                  <div className="tl-content w-100 flex items-center p-0">
                    <Typography.Paragraph
                      as="h3"
                      weight="bold"
                      className="text-gray-700"
                      children={t("academy_verification.status.academy_verified")}
                    />
                  </div>
                </div>
              </div>
            </>
          );
      }
    }
  }, [entityStatus]);

  return (
    <Layout title={t("academy_verification.title")}>
      <Layout.Container>
        <div className="mx-auto lg:w-7/12">
          {/* {academy && academy.is_in_ksa && entityStatus?.action == "approved" && (
            <NelcStatus status={entityStatus?.action} />
          )} */}
          <EntityStatus />
        </div>
      </Layout.Container>
    </Layout>
  );
}
