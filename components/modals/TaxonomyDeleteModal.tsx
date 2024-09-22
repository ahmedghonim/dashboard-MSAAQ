import React, { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadTaxonomies } from "@/actions/options";
import { Select } from "@/components/select";
import { useResponseToastHandler } from "@/hooks";
import { useDeleteTaxonomyMutation } from "@/store/slices/api/taxonomiesSlice";
import { APIActionResponse, Taxonomy, TaxonomyType } from "@/types";
import { randomUUID } from "@/utils";

import { Alert, Button, Form, Modal, ModalProps } from "@msaaqcom/abjad";

interface IFormDeleteInputs {
  id: number;
  alt_taxonomy_id: {
    label: string;
    value: any;
  } | null;
}

interface Props extends ModalProps {
  taxonomy: Taxonomy | null;
}

const TaxonomyDeleteModal: FC<Props> = ({ open, taxonomy, ...props }) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const { t } = useTranslation();
  const [deleteTaxonomyMutation] = useDeleteTaxonomyMutation();
  const schema = yup.object().shape({
    alt_taxonomy_id: yup
      .object()
      .shape({
        value: yup.string().required(),
        label: yup.string().required()
      })
      .required()
  });
  const isCategory =
    taxonomy && (taxonomy.type === TaxonomyType.COURSE_CATEGORY || taxonomy.type === TaxonomyType.POST_CATEGORY);
  const transNamespace = isCategory ? "categories" : "levels";
  const typeSingular = isCategory ? "category" : "level";

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting, isDirty },
    reset
  } = useForm<IFormDeleteInputs>({
    resolver: yupResolver(schema)
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const onSubmit: SubmitHandler<IFormDeleteInputs> = async (data: IFormDeleteInputs) => {
    if (!taxonomy || !data.alt_taxonomy_id) {
      return;
    }

    const deleted = (await deleteTaxonomyMutation({
      id: taxonomy?.id as number,
      alt_taxonomy_id: data.alt_taxonomy_id?.value
    })) as APIActionResponse<IFormDeleteInputs>;

    if (displayErrors(deleted)) {
      return;
    }

    displaySuccess(deleted);

    reset({
      alt_taxonomy_id: null
    });

    props.onDismiss?.();
  };
  return (
    taxonomy && (
      <Modal
        open={show}
        size="lg"
        {...props}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header>
            <Modal.HeaderTitle>
              {taxonomy?.items_count <= 0
                ? t(`${transNamespace}.delete_title_${typeSingular}`)
                : t(`${transNamespace}.pick_before_delete_${typeSingular}`)}
            </Modal.HeaderTitle>
          </Modal.Header>
          <Modal.Body>
            <Modal.Content>
              <Alert
                variant="danger"
                title={
                  taxonomy?.items_count <= 0
                    ? t(`${transNamespace}.alert_delete_title_${typeSingular}`)
                    : t(`${transNamespace}.alert_pick_before_delete_${typeSingular}`)
                }
                children={
                  taxonomy?.items_count <= 0 ? (
                    <Trans
                      i18nKey={`${transNamespace}.alert_delete_description_${typeSingular}`}
                      values={{
                        name: taxonomy?.name
                      }}
                      components={{
                        b: <strong />
                      }}
                    />
                  ) : (
                    <Trans i18nKey={`${transNamespace}.alert_description_pick_before_delete_${typeSingular}`} />
                  )
                }
              />

              <Form.Group
                label={t(`${transNamespace}.pick_alt_${typeSingular}`)}
                className="mb-0 mt-6"
                errors={errors.alt_taxonomy_id?.message}
              >
                <Controller
                  render={({ field }) => (
                    <Select
                      placeholder={t(`${transNamespace}.pick_alt_${typeSingular}`)}
                      loadOptions={(inputValue, callback) => {
                        loadTaxonomies(
                          inputValue,
                          callback,
                          {
                            filters: {
                              type:
                                taxonomy?.type === "course_category"
                                  ? TaxonomyType.COURSE_CATEGORY
                                  : taxonomy?.type === "post_category"
                                  ? TaxonomyType.POST_CATEGORY
                                  : taxonomy?.type === "product_category"
                                  ? TaxonomyType.PRODUCT_CATEGORY
                                  : TaxonomyType.COURSE_DIFFICULTY
                            },
                            cache_key: randomUUID()
                          },
                          (data: any) => {
                            return data
                              .map((item: Taxonomy) => ({
                                label: item.name,
                                value: item.id,
                                ...item
                              }))
                              .filter((item: Taxonomy) => item.id !== taxonomy?.id);
                          }
                        );
                      }}
                      {...field}
                    />
                  )}
                  name={"alt_taxonomy_id"}
                  control={control}
                />
              </Form.Group>
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="lg"
              children={t("confirm")}
              type="submit"
              disabled={!isValid || isSubmitting || !isDirty}
            />
            <Button
              variant="dismiss"
              size="lg"
              children={t("undo")}
              onClick={() => {
                props.onDismiss?.();
                reset({
                  alt_taxonomy_id: null
                });
              }}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    )
  );
};

export default TaxonomyDeleteModal;
