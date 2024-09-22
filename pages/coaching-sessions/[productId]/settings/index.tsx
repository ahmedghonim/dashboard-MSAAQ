import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, UseFormSetValue, useFieldArray, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import { loadCoachingInstructors } from "@/actions/options";
import { Card, Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { Select } from "@/components/select";
import TimeField from "@/components/select/TimeField";
import CoachingSessionsTabs from "@/components/shared/products/CoachingSessionsTabs";
import { AuthContext, SubscriptionContext } from "@/contextes";
import { durationParser, useAppDispatch, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchProductQuery,
  useGoogleCalendarCheckMutation,
  useUpdateProductMutation
} from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType, User } from "@/types";
import { classNames } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { BellAlertIcon, BellIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Avatar, Button, Form, Icon, Modal, ModalProps, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface Instructor extends User {
  label: string;
  value: any;
}

interface IFormInputs {
  instructors: Instructor[];
  custom_duration: number;
  options: {
    duration: {
      label: string;
      value: number | string;
    };
    availability: Array<{
      user: Instructor;
      days: Array<{
        times?: {
          from: string | number;
          to: string | number;
        };
        active: boolean;
        name: string;
      }>;
    }>;
  };
}

interface instructorModalProps extends ModalProps {
  setValue: UseFormSetValue<IFormInputs>;
  currentInstructors: Instructor[];
  planLimit: number;
  productId: string | number;
}

const InstructorModal = ({ open, productId, currentInstructors, setValue, ...props }: instructorModalProps) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sentUsers, setSentUsers] = useState<number[]>([]);

  const schema = yup.object().shape({
    instructors: yup
      .array()
      .of(
        yup.object().shape({
          avatar: yup.mixed().notRequired(),
          label: yup.string().required(),
          value: yup.mixed().required()
        })
      )
      .min(1)
      .max(props.planLimit, t("coaching_sessions.instructor_limit_validation", { max: props.planLimit }))
      .required()
  });

  const form = useForm<IFormInputs>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting: isSubmittingForm },
    setValue: setFormValue
  } = form;

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  useEffect(() => {
    setFormValue("instructors", currentInstructors);
  }, [currentInstructors]);

  const [checkGoogle] = useGoogleCalendarCheckMutation();

  const checkUser = useCallback(async (userId: number) => {
    if (isSubmitting) return;

    const response = (await checkGoogle({
      id: productId,
      userId
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      setIsSubmitting(false);
      return;
    }
    setSentUsers((prev) => [...prev, userId]);
    setIsSubmitting(false);
  }, []);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setValue("instructors", data.instructors);
    props.onDismiss?.();
    return;
  };
  return (
    <Modal
      open={show}
      className="!max-w-[488px]"
      onDismiss={() => {
        props.onDismiss?.();
      }}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header>{t("coaching_sessions.instructor_modal_title")}</Modal.Header>
        <Modal.Content>
          <Modal.Body>
            <div>
              <Form.Group
                label={t("coaching_sessions.instructors")}
                errors={errors.instructors?.message}
                required
              >
                <Controller
                  name={"instructors"}
                  control={control}
                  render={({ field }) => (
                    <Select
                      components={{
                        Option: (props) => (
                          <components.Option {...props}>
                            <>
                              {!props.data.has_google_calendar ? (
                                <div className="group flex items-center justify-between">
                                  <div className="mr-auto w-full cursor-not-allowed">
                                    <Tooltip>
                                      <Tooltip.Trigger className="w-full">
                                        <span className="mr-2 w-full text-sm text-gray-800">
                                          {t("coaching_sessions.instructor_need_to_install_google_calendar", {
                                            user_name: props.data.label
                                          })}
                                        </span>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content>{t("coaching_sessions.notification_tooltip")}</Tooltip.Content>
                                    </Tooltip>
                                  </div>
                                  <Button
                                    className={"flex-shrink-0 text-primary hover:text-primary disabled:text-primary"}
                                    size="sm"
                                    disabled={isSubmitting || sentUsers.includes(props.data.value)}
                                    variant={"link"}
                                    onClick={() => {
                                      setIsSubmitting(true);
                                      checkUser(props.data.value);
                                    }}
                                    children={
                                      sentUsers.includes(props.data.value)
                                        ? t("coaching_sessions.message_has_been_sent")
                                        : t("coaching_sessions.send_notification")
                                    }
                                    icon={
                                      <Icon>
                                        {sentUsers.includes(props.data.value) ? <BellAlertIcon /> : <BellIcon />}
                                      </Icon>
                                    }
                                  />
                                </div>
                              ) : (
                                <span className="mr-2 text-sm">{props.data.label}</span>
                              )}
                            </>
                          </components.Option>
                        )
                      }}
                      defaultOptions
                      isMulti
                      placeholder={t("select_from_list")}
                      loadOptions={loadCoachingInstructors}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </div>
          </Modal.Body>
        </Modal.Content>
        <Modal.Footer className="justify-between gap-x-2 !p-4">
          <Button
            size="lg"
            type="submit"
            disabled={!isValid || isSubmittingForm}
            isLoading={isSubmittingForm}
            children={t("add")}
          />
          <Button
            variant="dismiss"
            size="lg"
            onClick={() => {
              props.onDismiss?.();
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState<
    | {
        label: string;
        value: any;
        has_google_calendar: boolean;
      }
    | undefined
  >(undefined);

  const { user } = useContext(AuthContext);

  const { getAddon, subscription } = useContext(SubscriptionContext);

  const planLimit = useMemo(() => {
    return getAddon("products-sessions.coaches")?.limit ?? 1;
  }, [subscription?.plan?.slug]);

  const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
  const times = [
    { label: "coaching_sessions.times.15min", value: 15 },
    { label: "coaching_sessions.times.30min", value: 30 },
    { label: "coaching_sessions.times.45min", value: 45 },
    { label: "coaching_sessions.times.60min", value: 60 },
    { label: "coaching_sessions.times.custom", value: "custom" }
  ];
  const schema = yup.object().shape({
    instructors: yup
      .array()
      .of(
        yup.object().shape({
          avatar: yup.mixed().notRequired(),
          id: yup.number().notRequired(),
          label: yup.string().required(),
          value: yup.mixed().required(),
          has_google_calendar: yup.boolean().required()
        })
      )
      .min(1)
      .max(Number(planLimit))
      .required(),
    custom_duration: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .when("duration", {
        is: "custom",
        then: yup
          .number()
          .min(1)
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .required()
      }),
    options: yup.object().shape({
      duration: yup
        .object({
          label: yup.string().required(),
          value: yup.mixed().required()
        })
        .required(),
      availability: yup
        .array()
        .of(
          yup.object().shape({
            user: yup.object().required(),
            days: yup.array().when("user.has_google_calendar", {
              is: true,
              then: yup
                .array()
                .of(
                  yup.object().shape({
                    active: yup.boolean().required(),
                    name: yup.string().required(),
                    times: yup.object().when("active", {
                      is: true,
                      then: yup
                        .object({
                          from: yup.string().required(),
                          to: yup.string().required()
                        })
                        .required("Time is required when day is active"),
                      otherwise: yup.object().notRequired()
                    })
                  })
                )
                .required()
                .test("at-least-one-active", t("coaching_sessions.days_error_validation"), (days: any) => {
                  return days.some((day: any) => day.active && day.times.from && day.times.to);
                })
            })
          })
        )
        .required()
    })
  });

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, isLoading } = useFetchProductQuery(productId as string);
  const [updateProductMutation] = useUpdateProductMutation();

  const form = useForm<IFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(schema)
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options.availability"
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
    setValue,
    setError
  } = form;

  const handleDeleteClick = async (index: number, label: string) => {
    const confirmed = await confirm({
      title: t("coaching_sessions.delete_title"),
      variant: "danger",
      okLabel: t("coaching_sessions.delete_label"),
      cancelLabel: t("cancel"),
      checkboxLabel: "label",
      children: t("coaching_sessions.delete_field_confirm", { label })
    });

    if (confirmed) {
      setValue(
        "instructors",
        watch("instructors").filter((_, i) => i !== index)
      );

      remove(index);
      setCurrentInstructor(watch("instructors")[0]);
    }
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/coaching-sessions/${productId}` });
    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const instructorIndex = useMemo(() => {
    return fields.findIndex((field) => field.user.id === currentInstructor?.value);
  }, [fields, currentInstructor]);

  useEffect(() => {
    const durations = [15, 30, 45, 60];
    if (!isLoading) {
      if (product?.options?.availability?.length > 0) {
        const instructors = product?.options?.availability?.map((availability) => ({
          avatar: availability.user.avatar,
          label: availability.user.name,
          value: availability.user.id,
          has_google_calendar: availability.user.has_google_calendar
        }));

        reset({
          instructors: instructors,
          options: {
            duration: {
              label: durations.includes(durationParser(Number(product?.options?.duration), "minute"))
                ? t(`coaching_sessions.times.${durationParser(Number(product?.options?.duration), "minute")}min`)
                : t("coaching_sessions.times.custom"),
              value: durations.includes(durationParser(Number(product?.options?.duration), "minute"))
                ? durationParser(Number(product?.options?.duration), "minute")
                : `custom`
            },

            availability: product?.options?.availability?.map((availability) => ({
              user: availability.user,
              days: days.map((day) => {
                const from = availability.days.find((d) => d.name == day)?.from
                  ? dayjs(
                      dayjs(new Date()).format("YYYY-MM-DD ") + availability.days.find((d) => d.name == day)?.from,
                      "YYYY-MM-DD HH:mm"
                    )
                  : dayjs(dayjs(new Date()).format("YYYY-MM-DD")).set("hour", 9).set("minute", 0);
                const to = availability.days.find((d) => d.name == day)?.to
                  ? dayjs(
                      dayjs(new Date()).format("YYYY-MM-DD ") + availability.days.find((d) => d.name == day)?.to,
                      "YYYY-MM-DD HH:mm"
                    )
                  : dayjs(dayjs(new Date()).format("YYYY-MM-DD")).set("hour", 17).set("minute", 0);
                return {
                  times: {
                    from: from?.toDate().valueOf(),
                    to: to?.toDate().valueOf()
                  },
                  active: availability.days.find((d) => d.name == day) ? true : false,
                  name: day
                };
              })
            }))
          },
          ...(durations.includes(durationParser(Number(product?.options?.duration), "minute"))
            ? {}
            : { custom_duration: durationParser(Number(product?.options?.duration), "minute") })
        });

        if (product?.options?.availability?.filter(($user) => $user.user.id == user?.id).length > 0) {
          setCurrentInstructor({
            label: product?.options?.availability?.filter(($user) => $user.user.id == user?.id)[0].user.name,
            value: product?.options?.availability?.filter(($user) => $user.user.id == user?.id)[0].user?.id,
            has_google_calendar: product?.options?.availability?.filter(($user) => $user.user.id == user?.id)[0].user
              ?.has_google_calendar
          });
        } else {
          setCurrentInstructor({
            label: product?.options?.availability?.[0]?.user?.name,
            value: product?.options?.availability?.[0]?.user?.id,
            has_google_calendar: product?.options?.availability?.[0]?.user?.has_google_calendar
          });
        }
      } else {
        reset({
          instructors: [
            {
              label: user?.name,
              value: user?.id,
              has_google_calendar: user?.has_google_calendar
            }
          ],
          options: {
            duration: {
              label: t(`coaching_sessions.times.30min`),
              value: 30
            },
            availability: [
              {
                user: user,
                days: days.map((day, index) => ({
                  active: false,
                  name: day,
                  times: {
                    from: dayjs(dayjs(new Date()).format("YYYY-MM-DD"))
                      .set("hour", 9)
                      .set("minute", 0)
                      .toDate()
                      .valueOf(),
                    to: dayjs(dayjs(new Date()).format("YYYY-MM-DD"))
                      .set("hour", 17)
                      .set("minute", 0)
                      .toDate()
                      .valueOf()
                  }
                }))
              }
            ]
          },
          ...(durations.includes(durationParser(Number(product?.options?.duration), "minute"))
            ? {}
            : { custom_duration: durationParser(Number(product?.options?.duration), "minute") })
        });
        setCurrentInstructor({
          label: user?.name,
          value: user?.id,
          has_google_calendar: user?.has_google_calendar
        });
      }

      dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
    }
  }, [product]);

  const currentInstructors = watch("instructors");
  useEffect(() => {
    if (currentInstructors?.length > 0) {
      const instructorIds = new Set(currentInstructors.map((instructor) => instructor.value));
      fields.map((field, index) => {
        if (!instructorIds.has(field.user.id)) {
          remove(index);
        }
      });

      currentInstructors.map((instructor, index) => {
        if (fields[index]?.user.id !== instructor.value) {
          append({
            user: instructor,
            days: days.map((day) => ({
              active: false,
              name: day,
              times: {
                from: dayjs(dayjs(new Date()).format("YYYY-MM-DD")).set("hour", 9).set("minute", 0).toDate().valueOf(),
                to: dayjs(dayjs(new Date()).format("YYYY-MM-DD")).set("hour", 17).set("minute", 0).toDate().valueOf()
              }
            }))
          });

          setCurrentInstructor({
            label: instructor.label,
            value: instructor.value,
            has_google_calendar: instructor.has_google_calendar
          });
        }
      });
    }
  }, [currentInstructors]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const $data = {
      id: product.id,
      options: {
        duration:
          data.options.duration.value == "custom"
            ? (data.custom_duration as number) * 60
            : (data.options.duration.value as number) * 60,
        availability: data.options.availability.map((availability) => ({
          user_id: availability.user.id,
          days: availability.days
            .filter((day) => day.active)
            .map((day) => ({
              name: day.name,
              from: dayjs(Number(day?.times?.from)).format("HH:mm"),
              to: dayjs(Number(day?.times?.to)).format("HH:mm")
            }))
        }))
      },
      type: ProductType.COACHING_SESSION
    };
    const updatedProduct = (await updateProductMutation($data)) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;
    if (router.query.onboarding) {
      eventBus.emit("tour:nextStep");
    }

    if (!router.query.onboarding) {
      await router.push(`/coaching-sessions/${productId}/pricing`);
    } else {
      eventBus.emit("tour:nextStep");
    }
  };

  return (
    <Layout title={product?.title}>
      <CoachingSessionsTabs preview_url={product?.url} />

      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={product}
                redirect={`/coaching-sessions/${productId}`}
                form={form}
              />
            }
          >
            <Card
              className="mb-6"
              id="instructors-details"
            >
              <Card.Body>
                <Typography.Paragraph
                  weight="medium"
                  className="mb-4"
                  children={
                    <span className="flex gap-1">
                      <span className="text-gray-700">{t("coaching_sessions.pick_instructors")}</span>
                      <span>
                        ({watch("instructors")?.length ?? 0}/{planLimit})
                      </span>
                    </span>
                  }
                />
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-4">
                    {watch("instructors")?.map((instructor, index) => (
                      <div
                        key={index}
                        className={classNames(
                          "group flex items-center  rounded-lg border border-transparent px-3 py-1",
                          instructor.value == currentInstructor?.value
                            ? "bg-primary/10 border-primary text-primary"
                            : ""
                        )}
                      >
                        <Button
                          className={classNames(
                            "bg-transparent !p-0 hover:bg-transparent",
                            instructor.value == currentInstructor?.value
                              ? "text-primary disabled:text-primary"
                              : "text-black disabled:text-black"
                          )}
                          onClick={() => {
                            setCurrentInstructor(instructor);
                          }}
                        >
                          <div className="flex w-full items-center gap-3">
                            <Avatar
                              className={"flex-shrink-0 text-black"}
                              name={instructor.label}
                              imageUrl={instructor?.avatar?.url}
                            />
                            <Typography.Paragraph
                              className="flex-shrink-0"
                              children={instructor.label}
                            />
                          </div>
                        </Button>
                        {watch("instructors")?.length > 1 && instructor.value == currentInstructor?.value && (
                          <Button
                            onClick={async () => {
                              let $index = fields.findIndex((field) => field.user.id === instructor.value);

                              await handleDeleteClick($index, instructor.label);
                            }}
                            className="!bg-transparent !p-0 "
                            icon={
                              <Icon className="text-black">
                                <XMarkIcon />
                              </Icon>
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    disabled={watch("instructors")?.length >= Number(planLimit)}
                    onClick={() => {
                      setShowInstructorModal(true);
                    }}
                    className="flex-shrink-0 bg-transparent p-0 text-gray-800 hover:bg-transparent disabled:text-gray-800"
                    children={
                      <div className="flex items-center gap-3">
                        <div className="rounded-full border p-2">
                          <Icon>
                            <PlusIcon />
                          </Icon>
                        </div>
                        <span>{t("coaching_sessions.add_new_instructor")}</span>
                      </div>
                    }
                  />
                </div>
                <Form.Errors errors={errors?.instructors?.message} />
                <Form.Errors errors={errors?.options?.availability?.[instructorIndex]?.days?.message} />
              </Card.Body>
            </Card>
            {currentInstructor && (
              <Form.Section
                title={t("coaching_sessions.section.title")}
                description={t("coaching_sessions.section.description")}
                className="mb-6"
                id="coaching-sessions-details"
              >
                <Card>
                  <Card.Header>{t("coaching_sessions.section_title")}</Card.Header>
                  <Card.Body>
                    <Form.Group
                      className="!mb-4"
                      required
                      label={t("coaching_sessions.duration")}
                      errors={errors.options?.duration?.message}
                    >
                      <Controller
                        name={"options.duration"}
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={times.map((time) => {
                              return {
                                label: t(time.label),
                                value: time.value
                              };
                            })}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                    {watch("options.duration")?.value === "custom" && (
                      <Form.Group
                        className="!mb-4"
                        required
                        label={t("coaching_sessions.custom_duration")}
                        errors={errors.custom_duration?.message}
                      >
                        <Controller
                          name={"custom_duration"}
                          control={control}
                          render={({ field }) => (
                            <Form.Number
                              placeholder="45"
                              min={0}
                              suffix={t("minute")}
                              {...field}
                            />
                          )}
                        />
                      </Form.Group>
                    )}
                    <hr className="mb-4" />
                    <div
                      key={currentInstructor?.value}
                      className="flex flex-col gap-3"
                    >
                      {fields[instructorIndex]?.days.map((day, index) => (
                        <div
                          key={index}
                          className={classNames(
                            "rounded-lg border",
                            day.active ? "border-transparent bg-gray-200" : "bg-white"
                          )}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setValue(`options.availability.${instructorIndex}.days.${index}.active`, !day.active);
                            }}
                            className="flex cursor-pointer items-center p-4"
                          >
                            <Controller
                              control={control}
                              name={`options.availability.${instructorIndex}.days.${index}.active`}
                              render={({ field: { value, ...rest } }) => (
                                <Form.Checkbox
                                  id={`days-${index}`}
                                  value={Number(value ?? 0)}
                                  checked={value}
                                  className="ml-4"
                                  {...rest}
                                />
                              )}
                            />
                            <span>{t(`coaching_sessions.days.${day.name}`)}</span>
                          </div>
                          <div>
                            {watch(`options.availability.${instructorIndex}.days.${index}.active`) && (
                              <div className="p-4">
                                <Controller
                                  control={control}
                                  name={`options.availability.${instructorIndex}.days.${index}.times`}
                                  render={({ field }) => <TimeField {...field} />}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Form.Section>
            )}
          </Layout.FormGrid>
        </Form>
        {product && !isLoading && (
          <InstructorModal
            open={showInstructorModal}
            currentInstructors={currentInstructors}
            setValue={setValue}
            planLimit={Number(planLimit)}
            onDismiss={() => {
              setShowInstructorModal(false);
            }}
            productId={product.id}
          />
        )}
      </Layout.Container>
    </Layout>
  );
}
