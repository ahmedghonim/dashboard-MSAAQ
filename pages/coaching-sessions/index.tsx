import { useContext, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { isEmpty } from "lodash";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Card, CreateNewModal, Layout, Price, useShareable } from "@/components";
import { Datatable, EmptyStateTable } from "@/components/datatable";
import SessionsTabs from "@/components/shared/products/CoachingSessionIndexTabs";
import { AuthContext } from "@/contextes";
import {
  GTM_EVENTS,
  durationParser,
  isSuperAdmin,
  useAppSelector,
  useConfirmableDelete,
  useCopyToClipboard,
  useDataExport,
  useReplicateAction,
  useResponseToastHandler
} from "@/hooks";
import { useGTM } from "@/hooks/useGTM";
import i18nextConfig from "@/next-i18next.config";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useFetchProductsQuery,
  useReplicateProductMutation
} from "@/store/slices/api/productsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { APIActionResponse, Product, ProductType } from "@/types";
import { Permissions } from "@/types/models/permission";
import { getStatusColor } from "@/utils";

import {
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

const CoachingCard = ({ item }: any) => {
  const { t } = useTranslation();
  const [copy, values] = useCopyToClipboard();
  const share = useShareable();
  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteProductMutation
  });
  const { hasPermission } = useContext(AuthContext);
  const [replicate] = useReplicateAction({
    mutation: useReplicateProductMutation
  });

  return (
    <Card className="w-full">
      <Card.Body>
        <Link
          className="w-full"
          href={`/coaching-sessions/${item.id}`}
        >
          <div className={`mb-4 h-1 w-full rounded-full bg-${getStatusColor(item.status)}`} />
          <div className="mb-3 flex items-start">
            {!isEmpty(item.options) && (
              <Typography.Paragraph
                children={
                  item.options.duration
                    ? t("coaching_sessions.session_duration", {
                        duration: durationParser(Number(item.options.duration), "minute")
                      })
                    : t("coaching_sessions.null_duration")
                }
                size="md"
                weight="medium"
                className="text-primary"
              />
            )}

            <div className="mr-auto flex items-start gap-4">
              <Badge
                variant={getStatusColor(item.status)}
                soft
                rounded
              >
                <Trans
                  i18nKey={`statuses.${item.status}`}
                  children={item.status}
                />
              </Badge>
              <Dropdown>
                <Dropdown.Trigger>
                  <Button
                    variant="default"
                    size="sm"
                    icon={
                      <Icon
                        size="md"
                        children={<EllipsisHorizontalIcon />}
                      />
                    }
                  />
                </Dropdown.Trigger>
                <Dropdown.Menu
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {hasPermission(Permissions.COACHING_SESSIONS.UPDATE) && (
                    <Dropdown.Item
                      as={Link}
                      href={`/coaching-sessions/${item.id}/edit`}
                      children={t("edit")}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<PencilSquareIcon />}
                        />
                      }
                    />
                  )}
                  <Dropdown.Divider />
                  {item.status !== "draft" && (
                    <>
                      <Dropdown.Item
                        children={t("coaching_sessions.share_session")}
                        iconAlign="end"
                        onClick={() => {
                          share([
                            {
                              label: t("coaching_sessions.session_landing_page_url"),
                              url: item.url
                            },
                            {
                              label: t("coaching_sessions.session_direct_checkout_url"),
                              url: item.checkout_url
                            }
                          ]);
                        }}
                        icon={
                          <Icon
                            size="sm"
                            children={<ShareIcon />}
                          />
                        }
                      />
                      <Dropdown.Divider />
                    </>
                  )}
                  {item.meta.reviews_enabled && (
                    <>
                      <Dropdown.Item
                        as={Link}
                        href={`/coaching-sessions/${item.id}#reviews`}
                        children={t("show_reviews")}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<StarIcon />}
                          />
                        }
                      />
                      <Dropdown.Divider />
                    </>
                  )}
                  {hasPermission(Permissions.COACHING_SESSIONS.CREATE) && (
                    <>
                      <Dropdown.Item
                        children={t("duplicate")}
                        onClick={() => {
                          replicate(item.id);
                        }}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<DocumentDuplicateIcon />}
                          />
                        }
                      />
                    </>
                  )}
                  {hasPermission(Permissions.COACHING_SESSIONS.DELETE) && <Dropdown.Divider />}
                  {hasPermission(Permissions.COACHING_SESSIONS.DELETE) && (
                    <>
                      <Dropdown.Item
                        children={t("coaching_sessions.delete_session")}
                        iconAlign="end"
                        className="text-danger"
                        onClick={() => {
                          confirmableDelete({
                            id: item.id,
                            title: t("coaching_sessions.delete_session"),
                            label: t("coaching_sessions.delete_session_confirm"),
                            children: t("coaching_sessions.delete_session_confirm_message", { title: item.title })
                          });
                        }}
                        icon={
                          <Icon
                            size="sm"
                            color="danger"
                            children={<TrashIcon />}
                          />
                        }
                      />
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <Typography.Paragraph
            children={item.title}
            size="md"
            weight="medium"
            className="mb-3 truncate"
          />
          <Price price={item.price} />
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <Button
            disabled={item.status == "draft"}
            onClick={() => copy(item.url)}
            className="!text-primary"
            variant={"link"}
            children="نسخ الرابط"
            size="md"
            icon={
              <Icon children={!values.includes(item.url ?? "") ? <DocumentDuplicateIcon /> : <DocumentCheckIcon />} />
            }
          />
          <Button
            disabled={item.status == "draft"}
            children={t("coaching_sessions.share_session")}
            size="md"
            onClick={() => {
              share([
                {
                  label: t("coaching_sessions.session_landing_page_url"),
                  url: item.url
                },
                {
                  label: t("coaching_sessions.session_direct_checkout_url"),
                  url: item.checkout_url
                }
              ]);
            }}
            icon={
              <Icon>
                <ShareIcon />
              </Icon>
            }
          />
        </div>
      </Card.Body>
    </Card>
  );
};
export default function Index() {
  const { displayErrors } = useResponseToastHandler({});
  const { sendGTMEvent } = useGTM();

  const [showCreateProductModal, setShowCreateProductModal] = useState<boolean>(false);
  const { t } = useTranslation();
  const router = useRouter();

  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);

  const googleApp = useMemo(() => installedApps.find((app) => app.slug === "google-calendar"), [installedApps]);

  const { user, hasPermission } = useContext(AuthContext);

  const userIsSuperAdmin = useMemo(() => {
    return isSuperAdmin(user);
  }, [user?.roles]);

  const [exportCoachingSessions] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportCoachingSessions({
      endpoint: "/products/export",
      name: "coaching-sessions",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [createProduct] = useCreateProductMutation();

  const handleProductCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const product = (await createProduct({
      title,
      type: ProductType.COACHING_SESSION
    })) as APIActionResponse<Product>;

    if (displayErrors(product)) {
      return;
    } else {
      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: "session",
        product_title: title,
        product_id: product?.data.data.id
      });

      await router.push(`/coaching-sessions/${product?.data.data.id}/edit`);
    }
  };

  return (
    <Layout title={t("coaching_sessions.title")}>
      <SessionsTabs />
      <Layout.Container>
        <AddonController addon="products-sessions">
          <div className="grid-table coaching-table">
            <Datatable
              selectable={false}
              fetcher={useFetchProductsQuery}
              className="w-full"
              params={{
                filters: {
                  type: ProductType.COACHING_SESSION
                },
                per_page: 12
              }}
              columns={{
                columns: () => [
                  {
                    id: "card",
                    Cell: ({ row: { original } }: any) => <CoachingCard item={original} />
                  }
                ]
              }}
              toolbar={(instance) => {
                return (
                  <>
                    {(hasPermission(Permissions.COACHING_SESSIONS.EXPORT) || userIsSuperAdmin) && (
                      <Button
                        icon={
                          <Icon
                            size="sm"
                            children={<ArrowDownTrayIcon />}
                          />
                        }
                        onClick={() => handleExport(instance)}
                        variant="default"
                        size="md"
                        className="ltr:mr-4 rtl:ml-4"
                      >
                        <Typography.Paragraph
                          size="md"
                          weight="medium"
                          children={t("export")}
                        />
                      </Button>
                    )}
                    {((hasPermission(Permissions.COACHING_SESSIONS.CREATE) && googleApp?.installed) ||
                      userIsSuperAdmin) && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={userIsSuperAdmin ? false : !googleApp?.installed}
                        onClick={() => {
                          setShowCreateProductModal(true);
                        }}
                        icon={
                          <Icon
                            size="sm"
                            children={<PlusIcon />}
                          />
                        }
                        children={t("coaching_sessions.new_session")}
                      />
                    )}
                  </>
                );
              }}
              emptyState={
                <EmptyStateTable
                  title={t("coaching_sessions.empty_state.no_data_title")}
                  content={
                    !googleApp?.installed
                      ? t("coaching_sessions.empty_state.no_app_description")
                      : t("coaching_sessions.empty_state.no_data_description")
                  }
                  action={
                    !googleApp?.installed ? (
                      <Button
                        as={Link}
                        href={"/apps/google-calendar"}
                        size="md"
                        variant={"default"}
                        className="mx-auto mt-6 w-fit"
                        children={t("coaching_sessions.download_app")}
                      />
                    ) : hasPermission(Permissions.COACHING_SESSIONS.CREATE) ? (
                      <Button
                        variant="primary"
                        size="md"
                        className="mx-auto mt-6 w-fit"
                        disabled={!googleApp?.installed}
                        onClick={() => {
                          setShowCreateProductModal(true);
                        }}
                        icon={
                          <Icon
                            size="sm"
                            children={<PlusIcon />}
                          />
                        }
                        children={t("coaching_sessions.new_session")}
                      />
                    ) : null
                  }
                  icon={<ExclamationTriangleIcon />}
                />
              }
            />
          </div>

          <CreateNewModal
            title={t("coaching_sessions.add_new_session")}
            type="coaching-session"
            inputLabel={t("coaching_sessions.session_title_input_label")}
            inputPlaceholder={t("coaching_sessions.session_title_input_placeholder")}
            submitButtonText={t("coaching_sessions.add_new_session")}
            createAction={handleProductCreation}
            open={showCreateProductModal}
            onDismiss={() => {
              setShowCreateProductModal(false);
            }}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
