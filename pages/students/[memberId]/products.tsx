import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import EmptyData from "@/components/datatable/EmptyData";
import StudentProduct from "@/components/shared/students/StudentProduct";
import StudentsBaseLayout from "@/components/shared/students/StudentsBaseLayout";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useFetchDownloadsQuery } from "@/store/slices/api/downloadsSlice";
import { useFetchMemberQuery } from "@/store/slices/api/membersSlice";
import { APIActionResponse, APIResponse, Member, Product, ProductDownload, ProductType } from "@/types";

import { InboxStackIcon } from "@heroicons/react/24/outline";

import { Form, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Products() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [digitalProducts, setDigitalProducts] = useState<ProductDownload[]>([]);
  const [bundleProducts, setBundleProducts] = useState<ProductDownload[]>([]);
  const [coachingSessionProducts, setCoachingSessionProductsProducts] = useState<ProductDownload[]>([]);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const {
    query: { memberId }
  } = router;

  const { data: member = {} as Member } = useFetchMemberQuery(memberId as string);

  const { data: downloads = {} as APIResponse<ProductDownload>, isLoading } = useFetchDownloadsQuery({
    filters: {
      member_id: memberId as string
    }
  });

  useEffect(() => {
    if (!isLoading && downloads?.data) {
      setDigitalProducts(
        downloads.data
          .filter((download) => download.product && download.product.type === ProductType.DIGITAL)
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateA - dateB;
          })
      );
      setBundleProducts(
        downloads.data
          .filter((download) => download.product && download.product.type === ProductType.BUNDLE)
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateA - dateB;
          })
      );
      setCoachingSessionProductsProducts(
        downloads.data
          .filter((download) => download.product && download.product.type === ProductType.COACHING_SESSION)
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          })
      );
    }
  }, [downloads]);

  const removeProductAccessHandler = async (product: Product) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("students_flow.remove_access_to_product"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("students_flow.remove_access_to_product_description")}
          />
        )
      }))
    ) {
      return;
    }

    const response = (await axios.post(`/members/${member.id}/remove-access`, {
      products: [{ id: product.id, type: "product" }]
    })) as APIActionResponse<any>;

    if (displayErrors(response)) return;

    displaySuccess(response);

    await dispatch(
      apiSlice.util.invalidateTags([
        "member.downloads.index",
        {
          type: "members.index",
          id: member.id
        }
      ])
    );
  };

  return (
    <StudentsBaseLayout>
      <div className="flex flex-col space-y-4">
        <Form.Section>
          <div className="flex flex-col">
            <Typography.Paragraph
              weight="medium"
              size="md"
              children={t("products.title")}
              className="mb-2"
            />
            {digitalProducts.length ? (
              <Card>
                <Card.Body className="divide-y divide-gray-300 [&>:first-child]:pb-6 [&>:last-child]:pt-6 [&>:not(:first-child):not(:last-child)]:py-6">
                  {digitalProducts.map((download) => (
                    <StudentProduct
                      removeProductAccessHandler={async () => {
                        await removeProductAccessHandler({
                          ...(download.product as Product),
                          id: download.id
                        });
                      }}
                      key={`digital-product-${download.id}`}
                      product={{
                        ...(download.product as Product),
                        created_at: download.created_at
                      }}
                    />
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <EmptyData
                title={t("students_flow.empty_state.products.digital")}
                icon={<InboxStackIcon />}
              />
            )}
          </div>
        </Form.Section>
        <Form.Section>
          <div className="flex flex-col">
            <Typography.Paragraph
              weight="medium"
              size="md"
              children={t("coaching_sessions.title")}
              className="mb-2"
            />
            {coachingSessionProducts.length ? (
              <Card>
                <Card.Body className="divide-y divide-gray-300 [&>:first-child]:pb-6 [&>:last-child]:pt-6 [&>:not(:first-child):not(:last-child)]:py-6">
                  {coachingSessionProducts.map((download) => (
                    <StudentProduct
                      removeProductAccessHandler={async () => {
                        await removeProductAccessHandler({
                          ...(download.product as Product),
                          id: download.id
                        });
                      }}
                      key={`digital-product-${download.id}`}
                      product={{
                        ...(download.product as Product),
                        created_at: download.created_at
                      }}
                    />
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <EmptyData
                title={t("students_flow.empty_state.products.coaching_session")}
                icon={<InboxStackIcon />}
              />
            )}
          </div>
        </Form.Section>
        <Form.Section>
          <div className="flex flex-col">
            <Typography.Paragraph
              weight="medium"
              size="md"
              children={t("bundles.title")}
              className="mb-2"
            />
            {bundleProducts.length ? (
              <Card>
                <Card.Body className="divide-y divide-gray-300 [&>:first-child]:pb-6 [&>:last-child]:pt-6 [&>:not(:first-child):not(:last-child)]:py-6">
                  {bundleProducts.map((download) => (
                    <StudentProduct
                      removeProductAccessHandler={async () => {
                        await removeProductAccessHandler({
                          ...(download.product as Product),
                          id: download.id
                        });
                      }}
                      key={`digital-product-${download.id}`}
                      product={{
                        ...(download.product as Product),
                        created_at: download.created_at
                      }}
                    />
                  ))}
                </Card.Body>
              </Card>
            ) : (
              <EmptyData
                title={t("students_flow.empty_state.products.bundle")}
                icon={<InboxStackIcon />}
              />
            )}
          </div>
        </Form.Section>
      </div>
    </StudentsBaseLayout>
  );
}
