import { useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SegmentsCols, { SegmentsColumnsProps } from "@/columns/segments";
import { AddonController, Datatable, Layout, Tabs } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import SegmentModal from "@/components/segments/SegmentModal";
import { useDataExport, useIsRouteActive, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useDeleteSegmentMutation, useFetchSegmentsQuery } from "@/store/slices/api/segmentsSlice";
import { APIActionResponse, Segment } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

const Segments = () => {
  const [deleteSegment] = useDeleteSegmentMutation();
  const { isActive } = useIsRouteActive();
  const [showModals, setShowModals] = useState<boolean>(false);
  const [segment, setSegment] = useState<Segment | null>(null);

  const { t } = useTranslation();
  const { display } = useResponseToastHandler({});

  const [exportMembers] = useDataExport();

  const handleExport = async (tableInstance: any, payload?: any) => {
    exportMembers({
      endpoint: "/members/export",
      name: "members",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id),
      payload
    });
  };
  const deleteSegmentHandler = async (segment: Segment) => {
    if (
      !(await confirm({
        variant: "danger",
        okLabel: t("delete"),
        cancelLabel: t("undo"),
        title: t("students_flow.segments.delete_segment_title"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            className="text-gray-700"
            children={t("students_flow.segments.delete_segment_description")}
          />
        )
      }))
    ) {
      return;
    }

    const response = (await deleteSegment(segment.id)) as APIActionResponse<any>;

    display(response);
  };

  return (
    <Layout title={t("students_flow.segments.customers_segments")}>
      <Tabs>
        <Tabs.Link
          as={Link}
          active={isActive("/students")}
          href="/students"
          children={t("students_flow.title")}
        />
        <Tabs.Link
          as={Link}
          active={isActive("/students/segments")}
          href="/students/segments"
          children={t("students_flow.segments.settings")}
        />
      </Tabs>
      <Layout.Container>
        <AddonController
          type="page"
          addon="segments"
        >
          <Datatable
            columns={{
              columns: SegmentsCols,
              props: {
                exportSegmentHandler: (segment) =>
                  handleExport(
                    {
                      selectedFlatRows: []
                    },
                    {
                      filters: {
                        segment_id: segment.id
                      }
                    }
                  ),
                deleteSegmentHandler,
                editSegmentHandler: (segment) => {
                  setSegment(segment);
                  setShowModals(true);
                }
              } as SegmentsColumnsProps
            }}
            fetcher={useFetchSegmentsQuery}
            toolbar={() => (
              <Button
                variant="primary"
                children={t("students_flow.segments.create_new_segment")}
                onClick={() => setShowModals(true)}
                icon={<Icon children={<PlusIcon />} />}
              />
            )}
          />
          <SegmentModal
            open={showModals}
            onDismiss={() => {
              setShowModals(false);
              setSegment(null);
            }}
            segment={segment}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
};
export default Segments;
