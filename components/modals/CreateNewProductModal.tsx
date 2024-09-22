import { FC, useCallback, useContext, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { SubscriptionContext } from "@/contextes";
import { GTM_EVENTS, useGTM, useResponseToastHandler } from "@/hooks";
import { useCreateArticleMutation } from "@/store/slices/api/articlesSlice";
import { useCreateCourseMutation } from "@/store/slices/api/coursesSlice";
import { useCreateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Plans, ProductType } from "@/types";
import { classNames } from "@/utils";

import {
  AcademicCapIcon,
  CalendarDaysIcon,
  FolderIcon,
  MapPinIcon,
  RssIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps } from "@msaaqcom/abjad";

interface CreateNewProductModalProps extends ModalProps {
  open: boolean;
}

interface IFormInputs {
  title: string;
  type: "course" | "bundle" | "digital" | "session" | "article" | "coupon" | "on_site";
}

const CreateNewProductModal: FC<CreateNewProductModalProps> = ({ open, size, ...props }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [show, setShow] = useState<boolean>(open);
  const { subscription } = useContext(SubscriptionContext);

  const [createCourseMutation] = useCreateCourseMutation();
  const [createArticleMutation] = useCreateArticleMutation();
  const [createProductMutation] = useCreateProductMutation();
  useEffect(() => {
    setShow(open);
  }, [open]);

  const schema = yup.object({
    title: yup.string().required(),
    type: yup.string().required()
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const { displayErrors } = useResponseToastHandler({ setError });

  const getMutation = useCallback((type: string) => {
    switch (type) {
      case "article":
        return createArticleMutation;
      case "course":
      case "on_site":
        return createCourseMutation;
      case "bundle":
      case "session":
      case "digital":
        return createProductMutation;
    }
  }, []);

  const getRedirectPath = useCallback((type: string, id: string | number) => {
    switch (type) {
      case "article":
        return `/blog/${id}/edit`;
      case "course":
        return `/courses/${id}/chapters`;
      case "on_site":
        return `/courses/${id}/details`;
      case "bundle":
        return `/bundles/${id}/edit`;
      case "session":
        return `/coaching-sessions/${id}/edit`;
      case "digital":
        return `/products/${id}/edit`;
    }
  }, []);

  const { sendGTMEvent } = useGTM();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    if (data.type !== "coupon") {
      const mutation = getMutation(data.type);
      const productType = {
        course: ProductType.ONLINE,
        article: undefined,
        on_site: ProductType.ON_SITE,
        session: ProductType.COACHING_SESSION,
        bundle: ProductType.BUNDLE,
        digital: ProductType.DIGITAL
      };
      if (!mutation) return;

      const product = (await mutation({
        title: data.title,
        type: productType[data.type] as any
      })) as APIActionResponse<any>;

      if (displayErrors(product)) {
        return;
      }

      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: data.type,
        product_title: product.data.data.title,
        product_id: product.data.data.id
      });

      const redirectPath = getRedirectPath(data.type, product.data.data.id);

      if (!redirectPath) return;

      await router.push(redirectPath);
      setShow(false);
    } else {
      await router.push({
        pathname: `/marketing/coupons/create`,
        query: {
          code: data.title
        }
      });
      setShow(false);
    }
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("add_new")} />
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="space-y-6">
            <Form.Group
              errors={errors.title?.message}
              required
              label={t("title")}
              className="mb-0"
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("add_new_input_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "course" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-course"
                      value="course"
                      checked={value === "course"}
                      label={t("courses.course")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<AcademicCapIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
              {subscription?.plan?.slug == Plans.ADVANCED && (
                <Controller
                  name={"type"}
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <label
                      className={classNames(
                        "w-full cursor-pointer rounded border px-4 py-4",
                        "flex items-center gap-2",
                        value === "on_site" ? "border-primary bg-primary-50" : "border-gray"
                      )}
                    >
                      <Form.Radio
                        id="type-on_site"
                        value="on_site"
                        checked={value === "on_site"}
                        label={t("on_site.on_site_course")}
                        {...field}
                      />

                      <Icon
                        size="lg"
                        children={<MapPinIcon />}
                        className="mr-auto"
                      />
                    </label>
                  )}
                />
              )}
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "digital" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-digital"
                      value="digital"
                      checked={value === "digital"}
                      label={t("products.digital_product")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<ShoppingBagIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "session" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-session"
                      value="session"
                      checked={value === "session"}
                      label={t("coaching_sessions.coaching_session")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<CalendarDaysIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "bundle" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-bundle"
                      value="bundle"
                      checked={value === "bundle"}
                      label={t("bundles.bundle")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<FolderIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "article" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-article"
                      value="article"
                      checked={value === "article"}
                      label={t("articles.article")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<RssIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
              <Controller
                name={"type"}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <label
                    className={classNames(
                      "w-full cursor-pointer rounded border px-4 py-4",
                      "flex items-center gap-2",
                      value === "coupon" ? "border-primary bg-primary-50" : "border-gray"
                    )}
                  >
                    <Form.Radio
                      id="type-coupon"
                      value="coupon"
                      checked={value === "coupon"}
                      label={t("marketing.coupons.coupon")}
                      {...field}
                    />

                    <Icon
                      size="lg"
                      children={<RssIcon />}
                      className="mr-auto"
                    />
                  </label>
                )}
              />
            </div>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="lg"
            className="w-full"
            type="submit"
            children={t("add_new")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateNewProductModal;
