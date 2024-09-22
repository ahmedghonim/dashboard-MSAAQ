import { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout, Taps } from "@/components";
import GoogleMapModal from "@/components/modals/GoogleMapModal";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery, useUpdateCourseMutation } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, Course } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { MapPinIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Tooltip } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  location: {
    address: string;
    url: string;
    building: string;
    special_mark: string;
  };
  timing: {
    from: string;
    to: string;
  };
  notification: {
    before_start: boolean;
    when_start: boolean;
    after_complete: boolean;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState<string>("");

  const schema = yup.object().shape({
    location: yup
      .object()
      .shape({
        url: yup.string().url(t("validation.must_be_a_valid_url")).nullable().required(),
        building: yup.string().nullable().required(),
        address: yup.string().nullable().required(),
        special_mark: yup.string().nullable().required()
      })
      .required(),
    timing: yup.object().shape({
      from: yup.string().nullable().required(),
      to: yup
        .string()
        .nullable()
        .required()
        .test("is-greater", t("validation.date_not_less"), function (value) {
          const { from } = this.parent;
          return from && value && from < value;
        })
    }),

    notification: yup.object().shape({
      before_start: yup.boolean().required(),
      when_start: yup.boolean().required(),
      after_complete: yup.boolean().required()
    })
  });

  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const [updateCourseMutation] = useUpdateCourseMutation();

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    setError,
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (!isEmpty(course)) {
      reset({
        title: course?.title,
        location: {
          address: course?.location?.address,
          url: course?.location?.url,
          building: course?.location?.building,
          special_mark: course?.location?.special_mark
        },
        timing: {
          from: course?.timing?.from,
          to: course?.timing?.to
        },
        notification: {
          before_start: course?.notification?.before_start,
          when_start: course?.notification?.when_start,
          after_complete: course?.notification?.after_complete
        }
      });
    }
  }, [course]);

  useEffect(() => {
    if (url) {
      setValue("location.url", url, { shouldValidate: true, shouldDirty: true });
    }
  }, [url]);
  useEffect(() => {
    if (watch("title")) {
      dispatch({ type: "app/setTitle", payload: watch("title") });
    } else {
      dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
    }
  }, [watch("title")]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedCourse = (await updateCourseMutation({
      id: courseId as any,
      ...data,
      timing: {
        from: dayjs(data.timing.from).format("YYYY-MM-DD"),
        to: dayjs(data.timing.to).format("YYYY-MM-DD")
      }
    })) as APIActionResponse<Course>;

    if (displayErrors(updatedCourse)) return;

    displaySuccess(updatedCourse);

    if (!router.query.onboarding) {
      await router.push(`/courses/${courseId}/settings`);
    } else {
      eventBus.emit("tour:nextStep");
    }
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}` });
    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  return (
    <Layout title={course?.title}>
      <Taps
        preview_url={course.url}
        type={course.type}
      />
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={course}
                redirect={`/courses/${courseId}`}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("on_site.section_title")}
              description={t("on_site.section_subtitle")}
              className="mb-6"
              hasDivider
              id="general-settings"
            >
              <Form.Group
                required
                label={t("on_site.location_label")}
                errors={errors.location?.url?.message}
              >
                <Controller
                  name="location.url"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      className="[&>input]:!pr-0"
                      placeholder={"https://google.com/maps/place/Riyadh+Saudi+Arabia"}
                      dir="ltr"
                      prepend={
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Button
                              className="!bg-transparent"
                              onClick={() => setShow(true)}
                              icon={
                                <Icon
                                  className="text-black"
                                  children={<MapPinIcon />}
                                />
                              }
                            ></Button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>{t("on_site.pin_on_map")}</Tooltip.Content>
                        </Tooltip>
                      }
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                label={t("on_site.address_label")}
                errors={errors.location?.address?.message}
                required
              >
                <Controller
                  name="location.address"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("on_site.address_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <div className="flex flex-col gap-4 lg:flex-row">
                <Form.Group
                  required
                  className="w-full"
                  label={t("on_site.building_label")}
                  errors={errors.location?.building?.message}
                >
                  <Controller
                    name="location.building"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("on_site.building_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="w-full"
                  label={t("on_site.mark_label")}
                  errors={errors.location?.special_mark?.message}
                >
                  <Controller
                    name="location.special_mark"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("on_site.mark_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </div>
            </Form.Section>
            <Form.Section
              title={t("on_site.timing_title")}
              description={t("on_site.timing_subtitle")}
              className="mb-6"
              hasDivider
              id="general-settings"
            >
              <Form.Group
                required
                label={t("on_site.from_label")}
                errors={errors.timing?.from?.message}
              >
                <Controller
                  name="timing.from"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      type="date"
                      placeholder={t("on_site.from_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("on_site.to_label")}
                errors={errors.timing?.to?.message}
              >
                <Controller
                  name="timing.to"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      type="date"
                      placeholder={t("on_site.to_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("on_site.reminder_title")}
              description={t("on_site.reminder_subtitle")}
            >
              <Form.Group className="rounded-2xl bg-white p-4">
                <Controller
                  control={control}
                  name={"notification.before_start"}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("on_site.before_label")}
                      description={t("on_site.before_subtitle")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group className="rounded-2xl bg-white p-4">
                <Controller
                  control={control}
                  name={"notification.when_start"}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("on_site.start_label")}
                      description={t("on_site.start_subtitle")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group className="mb-0 rounded-2xl bg-white p-4">
                <Controller
                  control={control}
                  name={"notification.after_complete"}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("on_site.after_label")}
                      description={t("on_site.after_subtitle")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
          </Layout.FormGrid>
        </Form>
        <GoogleMapModal
          open={show}
          onDismiss={() => setShow(false)}
          onSetUrl={(url) => setUrl(url)}
        />
      </Layout.Container>
    </Layout>
  );
}
