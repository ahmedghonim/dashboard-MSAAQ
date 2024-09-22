import { createElement, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/router";

import { isArray, isEmpty } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { loadCategories, loadDifficulties, loadUsers } from "@/actions/options";
import { Select } from "@/components/select";
import { useDynamicSearchParams } from "@/hooks";
import { Filter } from "@/types";
import { classNames, objectToQueryString, parseQueryString } from "@/utils";

import { FunnelIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Form, Icon, Modal, ModalRef, Typography } from "@msaaqcom/abjad";

export interface FiltersModalProps {
  filters: Array<Filter>;
}

const FiltersModal = ({ filters: providedFilters, ...props }: FiltersModalProps) => {
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { isValid, isSubmitting }
  } = useForm<any>();
  const [show, setShow] = useState<boolean>(false);
  const modalRef = useRef<ModalRef>();
  const filterRef = useRef<number>(0);
  const { t } = useTranslation();
  const router = useRouter();
  const [filters, setFilters] = useState<Array<Filter>>([]);
  const [appliedFilters, setAppliedFilters] = useState({} as any);
  const [currentFilters, setCurrentFilters] = useState({} as any);
  const searchParams = useDynamicSearchParams();

  const FiltersComponents: any = {
    select: {
      element: Select
    },
    relation: {
      element: Select
    },
    text: {
      element: Form.Input
    },
    category: {
      props: {
        loadOptions: loadCategories
      }
    },
    difficulty: {
      props: {
        loadOptions: loadDifficulties
      }
    },
    instructors: {
      props: {
        loadOptions: loadUsers
      }
    },
    number: {
      element: Form.Number
    },
    range: {
      element: Form.Input
    },
    created_at: {
      props: {
        type: "date"
      }
    },
    subscribed_at: {
      props: {
        type: "date"
      }
    }
  };
  useEffect(() => {
    if (providedFilters?.length) {
      setFilters(providedFilters);
    }

    return () => {
      setFilters([]);
    };
  }, [providedFilters]);

  const translationKey = useMemo<string>(
    () =>
      router.pathname
        .replace(/^\/+/, "")
        .replace(/\//g, ".")
        .replace(/[\[\]]/g, "")
        .split("?")[0],
    [router.pathname]
  );

  useEffect(() => {
    let filters: any = cloneDeep(appliedFilters);

    Object.keys(filters).map((key: any) => {
      let value = filters[key];

      if (isEmpty(value)) {
        delete filters[key];
        return;
      }

      if (isArray(value)) {
        value = value.map((item) => item.value);
        if (!value.length) {
          value = undefined;
        }
      } else if (value?.value) {
        value = value.value;
      }

      if (value) {
        filters[key] = value;
      }
    });

    if (filterRef.current === 0 && isEmpty(filters) && isEmpty(searchParams)) {
      filters = parseQueryString(router.asPath)?.filters || {};
    }

    if (isEmpty(filters)) {
      return;
    }

    const query: { page?: any; filters: any; search?: any } = {
      filters
    };

    if (router.query.page) {
      query.page = router.query.page;
    }
    if (router.query.search) {
      query.search = router.query.search;
    }

    searchParams.set(query);

    filterRef.current = filterRef.current + 1;
  }, [appliedFilters, currentFilters]);

  const handelValidFilters = () => {
    let values = cloneDeep(getValues());
    let currentFilters = getValues();

    Object.keys(currentFilters).map((key: any) => {
      let value = currentFilters[key];

      if (isEmpty(value)) {
        delete currentFilters[key];
        return;
      }
    });
    Object.keys(values).map((key: any) => {
      let value = values[key];

      if (isEmpty(value)) {
        delete values[key];
        return;
      }

      if (isArray(value)) {
        value = value.map((item) => item.value);
        if (!value.length) {
          value = undefined;
        }
      } else if (value?.value) {
        value = value.value;
      }

      if (value) {
        if (key === "created_at") {
          values[key] = {
            from: value,
            to: value
          };
        } else {
          values[key] = value;
        }
      }
    });

    const query: { page?: any; filters: any; search?: any } = {
      filters
    };

    if (router.query.page) {
      query.page = router.query.page;
    }
    if (router.query.search) {
      query.search = router.query.search;
    }

    searchParams.set({
      ...query,
      filters: values
    });

    if (router.query.page) {
      query.page = router.query.page;
    }
    if (router.query.search) {
      query.search = router.query.search;
    }

    searchParams.set({
      ...query,
      filters: values
    });

    setAppliedFilters(values);
    setCurrentFilters(currentFilters);
  };

  const getFilterLabel = (value: any) => {
    if (isEmpty(value)) {
      return null;
    }

    if (isArray(value)) {
      value = value.map((item) => item.label);
      if (!value.length) {
        value = undefined;
      }
    } else if (value?.label) {
      value = value.label;
    }

    return value;
  };

  useEffect(() => {
    if (router.query && !objectToQueryString(router.query).includes("filters")) {
      Object.keys(getValues?.()).map((key: any) => {
        setValue(key, undefined);
      });
      setAppliedFilters({});
      setCurrentFilters({});
    }
  }, [router.query]);

  const onSubmit: SubmitHandler<any> = () => {
    handelValidFilters();

    modalRef.current?.close();
    setShow(false);
  };

  const removeFilter = (key: string) => {
    setValue(key as any, undefined);
    handelValidFilters();
  };

  return filters.length ? (
    <>
      <div className="flex">
        <Button
          variant="default"
          className="h-full"
          size="md"
          icon={
            <Icon
              size="sm"
              children={<FunnelIcon />}
            />
          }
          onClick={() => setShow(true)}
          children={t("filter")}
        />

        {Object.keys(currentFilters).length > 0 && (
          <div className="applied-filters">
            <Badge.Group
              className={classNames(
                // "applied-filters",
                "flex-nowrap rounded-md border border-gray bg-white",
                "overflow-y-hidden overflow-x-scroll whitespace-nowrap",
                "p-1.5 ltr:ml-4 rtl:mr-4",
                "h-[42px] w-[300px]"
              )}
            >
              {Object.keys(currentFilters).map((key) => {
                const value = getFilterLabel(currentFilters[key]);

                return value ? (
                  <Badge
                    key={key}
                    as="button"
                    className="h-full pl-1"
                    type="rounded"
                    variant="default"
                    soft
                    iconAlign="end"
                    onClick={() => removeFilter(key)}
                    icon={
                      <Icon
                        children={<XMarkIcon />}
                        className="text-gray-800"
                      />
                    }
                  >
                    <Typography.Paragraph
                      weight="medium"
                      children={`${t(`filters.${key}`)}: ${value}`}
                    />
                  </Badge>
                ) : null;
              })}
            </Badge.Group>
          </div>
        )}
      </div>

      <Modal
        open={show}
        ref={modalRef}
        size="lg"
        onDismiss={() => setShow(false)}
        {...props}
      >
        <Modal.Header>
          <Modal.HeaderTitle>
            <Trans i18nKey="filters.filter_results">Filter Results</Trans>
          </Modal.HeaderTitle>
        </Modal.Header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Modal.Content className="flex flex-col gap-y-6">
              {filters.map((filter, index) => {
                return (
                  FiltersComponents[filter.type] && (
                    <Form.Group
                      key={index}
                      className="mb-0"
                      label={t(`filters.${translationKey}.${filter.name}.label`)}
                    >
                      <Controller
                        name={filter.name}
                        control={control}
                        render={({ field }) => {
                          let options: boolean | object = true;

                          if (filter.options) {
                            options = Object.keys(filter.options).map((key) => ({
                              value: key,
                              label: filter.options[key as any]
                            }));
                          }
                          return createElement(FiltersComponents[filter.type].element, {
                            ...(FiltersComponents[filter.name] && FiltersComponents[filter.name].props),
                            ...field,
                            ...(filter.type === "select" && {
                              isClearable: true,
                              [filter.select_type === "multiple" ? "isMulti" : ""]: filter.select_type === "multiple",
                              [options ? "options" : ""]: options
                            }),
                            placeholder: t(`filters.${translationKey}.${filter.name}.placeholder`)
                          });
                        }}
                      />
                    </Form.Group>
                  )
                );
              })}
            </Modal.Content>
          </Modal.Body>

          <Modal.Footer>
            <Button
              size="lg"
              className="ml-2"
              variant="primary"
              type="submit"
              children={t("filters.filter_and_search")}
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              onClick={() => setShow(false)}
              children={t("cancel")}
            />
          </Modal.Footer>
        </form>
      </Modal>
    </>
  ) : null;
};

export default FiltersModal;
