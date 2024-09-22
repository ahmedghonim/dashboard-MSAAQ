import React, { useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, HelpdeskLink, Layout } from "@/components";
import ProductsAndCoursesSelect from "@/components/select/ProductsAndCoursesSelect";
import SegmentsSelect from "@/components/select/SegmentsSelect";
import { useAppDispatch, useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useCreateCouponMutation, useUpdateCouponMutation } from "@/store/slices/api/couponsSlice";
import { APIActionResponse, Course } from "@/types";
import { Coupon, CouponType } from "@/types/models/coupon";
import { classNames, convertPrice } from "@/utils";

import { BanknotesIcon, ReceiptPercentIcon } from "@heroicons/react/24/solid";

import { Form, Icon, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  code: string;
  type: CouponType;
  amount: number;
  expiry_at: string;
  minimum_amount: number;
  maximum_amount: number;
  usage_limit: number;
  usage_limit_per_user: number;
  allowed_products: Array<{}>;
  excluded_products: Array<{}>;
  allowed_segments: Array<{}>;
  excluded_segments: Array<{}>;
}

export default function CouponForm({ coupon }: { coupon?: Coupon }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { currentCurrency } = useFormatPrice();

  const schema = yup.object().shape({
    code: yup.string().nullable().required().min(3),
    type: yup.string().required(),
    amount: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable()
      .required()
      .min(1),
    expiry_at: yup.string().nullable(),
    minimum_amount: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable(),
    maximum_amount: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable(),
    usage_limit: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable(),
    usage_limit_per_user: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable(),
    allowed_products: yup.array().nullable(),
    excluded_products: yup.array().nullable(),
    allowed_segments: yup.array().nullable(),
    excluded_segments: yup.array().nullable()
  });

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    query: { code }
  } = router;

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
    reset
  } = form;

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        type: coupon.type,
        amount: coupon.type === CouponType.FLat ? convertPrice(coupon.amount) : coupon.amount,
        expiry_at: coupon.expiry_at,
        minimum_amount: convertPrice(coupon.minimum_amount),
        maximum_amount: convertPrice(coupon.maximum_amount),
        usage_limit: coupon.usage_limit,
        usage_limit_per_user: coupon.usage_limit_per_user,
        allowed_products: coupon.allowed_products.map((product) => ({
          id: product.id,
          label: product.title,
          value: (product as Course).certification ? `Course-${product.id}` : `Product-${product.id}`
        })),
        excluded_products: coupon.excluded_products.map((product) => ({
          id: product.id,
          label: product.title,
          value: (product as Course).certification ? `Course-${product.id}` : `Product-${product.id}`
        })),
        allowed_segments: coupon.allowed_segments.map((segment) => ({
          id: segment.id,
          label: segment.name,
          value: segment.id
        })),
        excluded_segments: coupon.excluded_segments.map((segment) => ({
          id: segment.id,
          label: segment.name,
          value: segment.id
        }))
      });
    }
  }, [coupon]);

  useEffect(() => {
    if (!coupon && code) {
      setValue("code", code as string);
    }
  }, [code]);

  const [createCouponMutation] = useCreateCouponMutation();
  const [updateCouponMutation] = useUpdateCouponMutation();

  useEffect(() => {
    dispatch({
      type: "app/setBackLink",
      payload: "/marketing/coupons"
    });

    dispatch({
      type: "app/setTitle",
      payload: coupon?.id
        ? t(`marketing.coupons.form.edit_coupon`, { code: coupon.code })
        : t(`marketing.coupons.create_coupon`)
    });
  }, [coupon]);

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const mutation = coupon?.id ? updateCouponMutation : createCouponMutation;

    const couponResponse = (await mutation({
      id: coupon?.id as number,
      code: data.code,
      type: data.type,
      amount: data.amount,
      expiry_at: data.expiry_at,
      minimum_amount: data.minimum_amount,
      maximum_amount: data.maximum_amount,
      usage_limit: data.usage_limit,
      usage_limit_per_user: data.usage_limit_per_user,
      // @ts-ignore
      allowed_products: data.allowed_products?.map((product) => product.value),
      // @ts-ignore
      excluded_products: data.excluded_products?.map((product) => product.value),
      // @ts-ignore
      allowed_segments: data.allowed_segments?.map((segment) => segment.value),
      // @ts-ignore
      excluded_segments: data.excluded_segments?.map((segment) => segment.value)
    })) as APIActionResponse<Coupon>;

    if (displayErrors(couponResponse)) return;
    displaySuccess(couponResponse);

    await router.push({
      pathname: `/marketing/coupons`
    });
  };

  return (
    <Layout
      title={
        coupon
          ? t(`marketing.coupons.form.edit_coupon`, { code: coupon.code })
          : t(`marketing.coupons.form.create_coupon`)
      }
    >
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={{ id: 1, ...coupon }}
                redirect={`/marketing/coupons`}
                form={form}
              />
            }
          >
            <AddonController addon="coupons">
              <Form.Section
                title={t("marketing.coupons.form.coupon_info")}
                description={
                  <Typography.Paragraph
                    size="md"
                    className="text-gray-700"
                  >
                    {t("marketing.coupons.form.coupon_info_description")}
                    <span className="my-2 flex" />
                    <Trans
                      i18nKey={"helpdesk_description"}
                      components={{
                        a: (
                          <HelpdeskLink
                            slug={coupon ? "kyfya-altaadyl-aal-kobon-alkhsm-tc8238" : "inshaaa-kobon-khsm-gdyd-2ey1i4"}
                            className="text-info hover:underline"
                          />
                        )
                      }}
                    />
                  </Typography.Paragraph>
                }
                className="mb-6"
                hasDivider
              >
                <Form.Group
                  required
                  label={t("marketing.coupons.form.code")}
                  errors={errors.code?.message}
                >
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("marketing.coupons.form.code_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.type")}
                  required
                >
                  <div className="flex items-start gap-4">
                    <Controller
                      name="type"
                      control={control}
                      defaultValue={CouponType.PERCENTAGE}
                      render={({ field: { value, ...field } }) => (
                        <label
                          className={classNames(
                            "w-full cursor-pointer rounded border px-4 py-4",
                            "flex items-center gap-2",
                            value === CouponType.PERCENTAGE ? "border-primary bg-primary-50" : "border-gray"
                          )}
                        >
                          <Form.Radio
                            id="type-percentage"
                            value={CouponType.PERCENTAGE}
                            checked={value === CouponType.PERCENTAGE}
                            label={t("marketing.coupons.types.percentage")}
                            {...field}
                          />

                          <Icon
                            size="lg"
                            children={<ReceiptPercentIcon />}
                            className="mr-auto"
                          />
                        </label>
                      )}
                    />

                    <Controller
                      name="type"
                      control={control}
                      defaultValue={CouponType.FLat}
                      render={({ field: { value, ...field } }) => (
                        <label
                          className={classNames(
                            "w-full cursor-pointer rounded border px-4 py-4",
                            "flex items-center gap-2",
                            value === CouponType.FLat ? "border-primary bg-primary-50" : "border-gray"
                          )}
                        >
                          <Form.Radio
                            id="type-flat"
                            value={CouponType.FLat}
                            checked={value === CouponType.FLat}
                            label={t("marketing.coupons.types.flat")}
                            {...field}
                          />

                          <Icon
                            size="lg"
                            children={<BanknotesIcon />}
                            className="mr-auto"
                          />
                        </label>
                      )}
                    />
                  </div>
                </Form.Group>

                <Form.Group
                  required
                  label={
                    watch("type") === CouponType.PERCENTAGE
                      ? t("marketing.coupons.form.amount_percentage")
                      : t("marketing.coupons.form.amount_flat")
                  }
                  placeholder="0"
                  errors={errors.amount?.message}
                >
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <Form.Number
                        placeholder="0"
                        suffix={watch("type") === CouponType.PERCENTAGE ? t("percent") : currentCurrency}
                        min={0}
                        max={watch("type") === CouponType.PERCENTAGE ? 100 : undefined}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.expiry_at")}
                  errors={errors.expiry_at?.message}
                  help={t("marketing.coupons.form.expiry_at_help")}
                  className="mb-0"
                >
                  <Controller
                    name="expiry_at"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        type="date"
                        placeholder="DD/MM/YYYY"
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </Form.Section>

              <Form.Section
                title={t("marketing.coupons.form.usage_conditions")}
                description={t("marketing.coupons.form.usage_conditions_description")}
                className="mb-6"
                hasDivider
              >
                <Form.Group
                  label={t("marketing.coupons.form.minimum_amount")}
                  tooltip={t("marketing.coupons.form.minimum_amount_tooltip")}
                  errors={errors.minimum_amount?.message}
                >
                  <Controller
                    name="minimum_amount"
                    control={control}
                    render={({ field }) => (
                      <Form.Number
                        suffix={currentCurrency}
                        {...field}
                        min={0}
                        placeholder="100"
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.maximum_amount")}
                  tooltip={t("marketing.coupons.form.maximum_amount_tooltip")}
                  errors={errors.maximum_amount?.message}
                >
                  <Controller
                    name="maximum_amount"
                    control={control}
                    render={({ field }) => (
                      <Form.Number
                        suffix={currentCurrency}
                        {...field}
                        min={0}
                        placeholder="2,000"
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.usage_limit")}
                  help={t("marketing.coupons.form.usage_limit_help")}
                  errors={errors.usage_limit?.message}
                >
                  <Controller
                    name="usage_limit"
                    control={control}
                    render={({ field }) => (
                      <Form.Number
                        suffix={t("once")}
                        {...field}
                        placeholder="50"
                        min={0}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.usage_limit_per_user")}
                  help={t("marketing.coupons.form.usage_limit_per_user_help")}
                  errors={errors.usage_limit_per_user?.message}
                  className={`mb-0`}
                >
                  <Controller
                    name="usage_limit_per_user"
                    control={control}
                    render={({ field }) => (
                      <Form.Number
                        suffix={t("once")}
                        {...field}
                        min={0}
                        placeholder="5"
                      />
                    )}
                  />
                </Form.Group>
              </Form.Section>

              <Form.Section
                title={t("marketing.coupons.form.products_section")}
                description={t("marketing.coupons.form.products_section_description")}
                className="mb-6"
                hasDivider
              >
                <Form.Group
                  label={t("marketing.coupons.form.allowed_products")}
                  errors={errors.allowed_products?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <ProductsAndCoursesSelect
                        placeholder={t("marketing.coupons.form.allowed_products_placeholder")}
                        {...field}
                      />
                    )}
                    name={"allowed_products"}
                    control={control}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.excluded_products")}
                  errors={errors.excluded_products?.message}
                  help={t("marketing.coupons.form.excluded_products_help")}
                  className={`mb-0`}
                >
                  <Controller
                    render={({ field }) => (
                      <ProductsAndCoursesSelect
                        placeholder={t("marketing.coupons.form.excluded_products_placeholder")}
                        {...field}
                      />
                    )}
                    name={"excluded_products"}
                    control={control}
                  />
                </Form.Group>
              </Form.Section>
              <Form.Section
                title={t("marketing.coupons.form.segments_section")}
                description={t("marketing.coupons.form.segments_section_description")}
                className="mb-0"
              >
                <Form.Group
                  label={t("marketing.coupons.form.allowed_segments")}
                  errors={errors.allowed_segments?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <SegmentsSelect
                        placeholder={t("marketing.coupons.form.allowed_products_placeholder")}
                        {...field}
                      />
                    )}
                    name={"allowed_segments"}
                    control={control}
                  />
                </Form.Group>

                <Form.Group
                  label={t("marketing.coupons.form.excluded_segments")}
                  errors={errors.excluded_segments?.message}
                  className={`mb-0`}
                >
                  <Controller
                    render={({ field }) => (
                      <SegmentsSelect
                        placeholder={t("marketing.coupons.form.excluded_products_placeholder")}
                        {...field}
                      />
                    )}
                    name={"excluded_segments"}
                    control={control}
                  />
                </Form.Group>
              </Form.Section>
            </AddonController>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
