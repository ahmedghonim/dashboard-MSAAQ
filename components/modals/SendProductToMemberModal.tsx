import React, { FC, useEffect, useRef, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card } from "@/components";
import ProductsAndCoursesSelect from "@/components/select/ProductsAndCoursesSelect";
import { CourseStatus, ProductStatus } from "@/types";

import { TrashIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  products: Array<{ id: number | string; label: string; value: string }>;
}

interface Props extends ModalProps {
  submitHandler: (products: { id: number; type: string }[]) => Promise<void>;
}

const SendProductToMemberModal: FC<Props> = ({ open = false, submitHandler, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(open);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const schema = yup.object().shape({
    products: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string().required(),
          label: yup.string().required(),
          value: yup.string().required()
        })
      )
      .min(1)
      .required()
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (watch("products")) {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    }
  }, [watch("products")]);
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;

    await submitHandler(
      data.products.map((product) => ({
        id: Number(product.id),
        type: product.value.split("-")[0].toLowerCase()
      }))
    );

    setShow(false);

    reset({
      products: []
    });

    props.onDismiss && props.onDismiss();
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={"إرسال هدية للطالب"} />
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Content>
          <Modal.Body>
            <div className="flex flex-col gap-y-6">
              <Form.Group
                label={t("students_flow.select_the_courses_or_products_included_in_the_gift")}
                required
                errors={errors.products?.message}
                className="mb-0"
              >
                <Controller
                  render={({ field }) => (
                    <ProductsAndCoursesSelect
                      filterProducts={(product) =>
                        product.status === ProductStatus.PUBLISHED || product.status === ProductStatus.UNLISTED
                      }
                      filterCourses={(course) =>
                        course.status === CourseStatus.PUBLISHED || course.status === CourseStatus.UNLISTED
                      }
                      placeholder={t("select_the_courses_or_products")}
                      {...field}
                    />
                  )}
                  name={"products"}
                  control={control}
                />
              </Form.Group>
              {watch("products")?.length > 0 && (
                <Form.Group
                  className="mb-0 space-y-4"
                  style={{
                    height: watch("products")?.length > 3 ? "275px" : "auto",
                    overflow: "scroll"
                  }}
                  label={t("bundles.bundle_select_products_label")}
                  ref={bodyRef}
                >
                  {watch("products")?.map((product, index) => (
                    <Card key={index}>
                      <Card.Body className="flex items-center justify-between">
                        <Typography.Paragraph
                          size="lg"
                          weight="medium"
                        >
                          {product.label}
                        </Typography.Paragraph>
                        <Button
                          variant="danger"
                          size="sm"
                          ghost
                          icon={
                            <Icon>
                              <TrashIcon />
                            </Icon>
                          }
                          onClick={() => {
                            const products = watch("products");
                            const newProducts = products.filter(({ id }) => id !== product.id);
                            setValue("products", newProducts, {
                              shouldDirty: true,
                              shouldValidate: true
                            });
                          }}
                        />
                      </Card.Body>
                    </Card>
                  ))}
                </Form.Group>
              )}
            </div>
          </Modal.Body>
        </Modal.Content>
        <Modal.Footer>
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={t("send")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => props.onDismiss && props.onDismiss()}
          >
            <Trans i18nKey="cancel">Cancel</Trans>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default SendProductToMemberModal;
