import { ChangeEvent, ReactElement, ReactNode, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import cloneDeep from "lodash/cloneDeep";
import { useTranslation } from "next-i18next";

import { EmptyState, FiltersModal } from "@/components";
import EmptyStateTable from "@/components/datatable/EmptyData";
import { useDynamicSearchParams } from "@/hooks";
import { APIResponse, Filter } from "@/types";
import { objectToQueryString } from "@/utils";

import { CircleStackIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { Form, Icon, Table, TableProps } from "@msaaqcom/abjad";

interface props extends Omit<TableProps<any>, "data"> {
  toolbar?: (instance: any) => ReactNode | any;
  emptyState?: ReactElement<typeof EmptyState>;
  setIsTableEmpty?: (value: boolean) => void;
  filter?: ReactNode;
  fetcher: any;
  columns: { columns: any; props?: object };
  params?: {
    [key: string]: any;
  };
  hasSearch?: boolean;
  onMetaLoaded?: (value: object) => void;
  onIsLoading?: (value: boolean) => void;
  hasFilter?: boolean;
  dataFormatter?: (data: object[]) => any;
  defaultPerPage?: number;
  scrollOnRouteChange?: boolean;
  isShallow?: boolean;
  renderFilters?: (filters: Array<Filter>) => ReactNode;
  toolbarClassName?: string;
  toolbarTitle?: ReactNode;
  onDataLoaded?: (data: any) => void;
}

const Datatable = ({
  toolbar,
  toolbarTitle,
  fetcher,
  filter,
  renderFilters,
  params: providedParams = {},
  columns: providedColumns,
  dataFormatter = (data) => data,
  hasSearch = false,
  hasFilter = true,
  defaultPerPage = 10,
  onDataLoaded,
  emptyState,
  setIsTableEmpty,
  onMetaLoaded,
  onIsLoading,
  scrollOnRouteChange = true,
  isShallow = false,
  toolbarClassName = "flex ltr:ml-auto rtl:mr-auto",
  ...props
}: props) => {
  const router = useRouter();
  const { page } = router.query;
  const { t } = useTranslation();

  const params = useMemo(() => ({ ...router.query, ...providedParams }), [providedParams, router.query]);
  const searchParams = useDynamicSearchParams();

  const { data: items = {} as APIResponse<object>, isLoading, isError, error } = fetcher(params);

  useEffect(() => {
    onIsLoading?.(isLoading);
  }, [isLoading, items]);

  const sortables = items?.meta?.sortable ?? [];
  const columns = useMemo(() => providedColumns.columns({ sortables, ...(providedColumns?.props ?? {}) }), [sortables]);
  useEffect(() => {
    setIsTableEmpty?.(!!items?.data?.length);
    onDataLoaded?.(items);
  }, [items]);
  const handleSortChange = (column: string | null, direction: "desc" | "asc" | null) => {
    let query = cloneDeep(router.query);

    if (!column) {
      delete query.sort;
      delete query.sort_direction;
    } else {
      query.sort = column;
      query.sort_direction = direction ?? "desc";
    }

    router.replace({
      query: objectToQueryString(query)
    });
  };

  const handlePagination = (pageIndex: number, page: number) => {
    router.replace(
      {
        query: objectToQueryString({
          ...router.query,
          page
        })
      },
      undefined,
      { scroll: scrollOnRouteChange, shallow: isShallow }
    );
  };

  const [timeoutState, setTimeoutState] = useState<number | any>(0);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (timeoutState) {
      clearTimeout(timeoutState);
    }

    setTimeoutState(
      setTimeout(async () => {
        searchParams.set({
          ...router.query,
          search: value.trim(),
          page: 1
        });
      }, 400)
    );
  };

  const Toolbar = (instance: any) => {
    return toolbar || renderFilters ? (
      <div className="mb-4 flex flex-row items-center">
        <div className="flex gap-3">
          {toolbarTitle && <div className="my-auto">{toolbarTitle}</div>}
          {hasFilter ? renderFilters?.(items?.meta?.filters) ?? <FiltersModal filters={items?.meta?.filters} /> : null}

          {hasSearch && (
            <Form.Input
              placeholder={t(
                `${
                  router.pathname
                    .replace("/", "")
                    .replaceAll("-", "_")
                    .replaceAll("/", ".")
                    .replaceAll(/[\[\]]/g, "")
                    .split("?")[0]
                }.search_input_placeholder`
              )}
              value={router.query?.search}
              onChange={handleSearch}
              className="h-[42px] lg:min-w-[390px]"
              prepend={
                <Icon className="text-gray-700 ltr:ml-3 rtl:mr-3">
                  <MagnifyingGlassIcon />
                </Icon>
              }
            />
          )}
        </div>

        {toolbar && (
          <div
            className={toolbarClassName}
            children={toolbar(instance)}
          />
        )}
      </div>
    ) : null;
  };

  const pageCount = Math.ceil(items.meta?.total / (items.meta?.per_page ?? defaultPerPage));
  useEffect(() => {
    if (pageCount < parseInt(params.page)) {
      handlePagination(0, 1);
    }
    if (items.meta) {
      onMetaLoaded?.(items.meta);
    }
  }, [items]);

  return !isError ? (
    <Table
      isLoading={isLoading}
      columns={columns}
      data={dataFormatter(items?.data ?? [])}
      hasPagination={items?.data?.length > 0 && pageCount > 1}
      pageCount={pageCount}
      pageSize={items.meta?.per_page ?? defaultPerPage}
      pageIndex={page ? parseInt(page as string) - 1 : 0}
      onPageChange={handlePagination}
      onSortChange={handleSortChange}
      renderToolbar={Toolbar}
      messages={{
        emptyState: emptyState ?? (
          <EmptyStateTable
            title={t("empty_state.no_data_title")}
            content={t("empty_state.no_data_description")}
            icon={<CircleStackIcon />}
          />
        )
      }}
      {...props}
    />
  ) : (
    <EmptyStateTable
      title={t("error_state.no_data_title")}
      content={t("error_state.no_data_content")}
      icon={<ExclamationTriangleIcon />}
    />
  );
};

export default Datatable;
