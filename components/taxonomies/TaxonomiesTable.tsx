import { ChangeEvent, FC, ReactNode, useContext, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import TaxonomiesCols from "@/columns/taxonomies";
import { Datatable, Layout, Tabs } from "@/components";
import TaxonomyDeleteModal from "@/components/modals/TaxonomyDeleteModal";
import { AuthContext } from "@/contextes";
import { useIsRouteActive, useResponseToastHandler } from "@/hooks";
import {
  useCreateTaxonomyMutation,
  useFetchTaxonomiesQuery,
  useReplicateTaxonomyMutation,
  useUpdateTaxonomyMutation
} from "@/store/slices/api/taxonomiesSlice";
import { APIActionResponse, Taxonomy, TaxonomyType } from "@/types";
import { getMissingFileIds, objectToQueryString, slugify } from "@/utils";

import { PlusIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, SingleFile } from "@msaaqcom/abjad";

import { Select } from "../select";

interface IFormInputs {
  id: number;
  type: {
    value: string;
    label: string;
  };
  name: string;
  slug: string;
  description: string | null;
  alt_taxonomy_id: {
    value: string;
    label: string;
  } | null;
  icon?: SingleFile[];
}

const TaxonomiesTable: FC<{ type: Array<TaxonomyType>; tabs?: ReactNode; title?: string }> = ({
  type,
  tabs,
  title
}) => {
  const { t } = useTranslation();

  const isCategory = type.includes(
    TaxonomyType.COURSE_CATEGORY || TaxonomyType.PRODUCT_CATEGORY || TaxonomyType.POST_CATEGORY
  );

  const { current_academy } = useContext(AuthContext);

  const transNamespace = isCategory ? "categories" : "levels";
  const typeSingular = isCategory ? "category" : "level";
  const shouldBeCourseOrProductCategory = type.includes(TaxonomyType.COURSE_CATEGORY || TaxonomyType.PRODUCT_CATEGORY);

  const { isActive } = useIsRouteActive();
  const router = useRouter();

  const schema = yup.object({
    name: yup.string().required(),
    slug: yup.string().required(),
    icon: yup.array().of(yup.mixed()),
    type: yup
      .object()
      .shape({})
      .when("$shouldBeCourseOrProductCategory", {
        is: true,
        then: yup.object().shape({}).required(),
        otherwise: yup.object().shape({})
      })
  });

  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Taxonomy | null>(null);

  const [createTaxonomy] = useCreateTaxonomyMutation();
  const [updateTaxonomy] = useUpdateTaxonomyMutation();
  const [replicateTaxonomy] = useReplicateTaxonomyMutation();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    reset
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    context: { shouldBeCourseOrProductCategory }
  });

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const deleteTaxonomyHandler = (taxonomy: Taxonomy) => {
    setTaxonomy(taxonomy);

    setShowDeleteModal(true);
  };

  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const onSubmit: SubmitHandler<IFormInputs> = async (data: IFormInputs) => {
    const mutation: any = editing?.id ? updateTaxonomy : createTaxonomy;
    const taxonomy = (await mutation({
      id: editing?.id,
      type: shouldBeCourseOrProductCategory ? data.type.value : type[0],
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon?.map((file) => file.file).pop(),
      "deleted-icon": getMissingFileIds(editing?.icon, data.icon ?? [])
    })) as APIActionResponse<Taxonomy>;

    if (displayErrors(taxonomy)) return;

    displaySuccess(taxonomy);

    setShowFormModal(false);

    dataReset();
  };

  const dataReset = () => {
    setEditing(null);

    reset({
      name: "",
      slug: "",
      description: "",
      icon: []
    });
  };

  return (
    <Layout title={title ?? t("taxonomies.title")}>
      {tabs ?? (
        <Tabs>
          <Tabs.Link
            as={Link}
            active={isActive("/taxonomies/categories")}
            href={{
              pathname: "/taxonomies/categories"
            }}
            children={t("categories.title")}
          />
          <Tabs.Link
            as={Link}
            active={isActive("/taxonomies/levels")}
            href={{
              pathname: "/taxonomies/levels"
            }}
            children={t("levels.title")}
          />
        </Tabs>
      )}

      <Layout.Container>
        <Datatable
          fetcher={useFetchTaxonomiesQuery}
          selectable={false}
          params={{
            filters: {
              type: type
            }
          }}
          columns={{
            columns: TaxonomiesCols,
            props: {
              deleteTaxonomyHandler,
              type,
              tenantUrl: current_academy?.domain,
              editHandler: (taxonomy: Taxonomy) => {
                setEditing(taxonomy);

                setShowFormModal(true);
                reset({
                  id: taxonomy.id,
                  name: taxonomy.name,
                  slug: taxonomy.slug,
                  description: taxonomy.description,
                  type: {
                    value: taxonomy.type,
                    label: t(taxonomy.type)
                  },
                  icon: taxonomy.icon ? [taxonomy.icon] : []
                });
              },
              replicateHandler: async (taxonomy: Taxonomy) => {
                const replicate = (await replicateTaxonomy(taxonomy.id)) as any;

                if (displayErrors(replicate)) {
                  return;
                } else {
                  displaySuccess(replicate);
                  await router.replace({
                    query: objectToQueryString({
                      ...router.query,
                      replicate: replicate?.data.data.id
                    })
                  });
                }
              }
            }
          }}
          toolbar={() => (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  dataReset();

                  setShowFormModal(true);
                }}
                icon={
                  <Icon
                    size="sm"
                    children={<PlusIcon />}
                  />
                }
                children={t(`${transNamespace}.add_new_${typeSingular}`)}
              />
            </>
          )}
        />

        <Modal
          size="lg"
          open={showFormModal}
          onDismiss={() => setShowFormModal(false)}
        >
          <Modal.Header>
            <Modal.HeaderTitle>
              {t(editing ? `${transNamespace}.edit_${typeSingular}` : `${transNamespace}.add_new_${typeSingular}`)}
            </Modal.HeaderTitle>
          </Modal.Header>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Modal.Content>
                <Form.Group
                  label={t(`${transNamespace}.${typeSingular}_name`)}
                  required
                  errors={errors.name?.message}
                  className={"mb-0"}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t(`${transNamespace}.${typeSingular}_name_placeholder`)}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                {shouldBeCourseOrProductCategory && (
                  <Form.Group
                    className="mb-0 mt-4"
                    label={t("category_type")}
                    required
                    errors={errors.type?.message}
                  >
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select
                          options={[
                            {
                              label: t("course_category"),
                              value: TaxonomyType.COURSE_CATEGORY
                            },
                            {
                              label: t("product_category"),
                              value: TaxonomyType.PRODUCT_CATEGORY
                            }
                          ]}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                )}

                <Form.Group
                  label={t(`${transNamespace}.${typeSingular}_url`)}
                  className={`mb-0 mt-4`}
                  required
                  errors={errors.slug?.message}
                >
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <Form.Input
                        dir="ltr"
                        append={
                          <div
                            className="bg-gray px-4 py-3"
                            dir="ltr"
                            children="/"
                          />
                        }
                        placeholder={t(`${transNamespace}.${typeSingular}_url_placeholder`)}
                        value={slugify(value)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          onChange(slugify(e.target.value));
                        }}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t(`${transNamespace}.${typeSingular}_description`)}
                  className={`mb-0 mt-4`}
                  errors={errors.description?.message}
                >
                  <Controller
                    name={"description"}
                    control={control}
                    render={({ field: { value, ...rest } }) => {
                      return (
                        <Form.Textarea
                          placeholder={t(`${transNamespace}.${typeSingular}_description_placeholder`)}
                          value={value ?? ""}
                          rows={5}
                          {...rest}
                        />
                      );
                    }}
                  />
                </Form.Group>
                {isCategory && (
                  <Form.Group
                    label={t(`${transNamespace}.${typeSingular}_input_icon`)}
                    className={`mb-0 mt-4`}
                    errors={errors.icon?.message}
                  >
                    <Controller
                      name={"icon"}
                      control={control}
                      render={({ field: { onChange, ...rest } }) => (
                        <Form.File
                          accept={["image/*"]}
                          maxFiles={1}
                          maxSize={2}
                          onChange={(files: SingleFile[]) => {
                            onChange(files);
                          }}
                          {...rest}
                        />
                      )}
                    />
                  </Form.Group>
                )}
              </Modal.Content>
            </Modal.Body>

            <Modal.Footer>
              <Button
                size="lg"
                className="ml-2"
                type="submit"
                children={t(editing?.id ? "save_changes" : "add_new")}
                disabled={isSubmitting || !isValid}
              />

              <Button
                ghost
                size="lg"
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  setShowFormModal(false);
                }}
                children={t("cancel")}
              />
            </Modal.Footer>
          </Form>
        </Modal>
        <TaxonomyDeleteModal
          onDismiss={() => {
            setTaxonomy(null);
            setShowDeleteModal(false);
          }}
          open={showDeleteModal}
          taxonomy={taxonomy}
        />
      </Layout.Container>
    </Layout>
  );
};

export default TaxonomiesTable;
