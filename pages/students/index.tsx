import { useContext, useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { searchInSegments } from "@/actions/options";
import MembersCols, { MembersColumnsProps } from "@/columns/members";
import { AddonController, FiltersModal, Layout, MemberInformationModal, Tabs } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { Datatable } from "@/components/datatable";
import SendProductToMemberModal from "@/components/modals/SendProductToMemberModal";
import StudentImportModal from "@/components/modals/StudentImportModal";
import SegmentModal from "@/components/segments/SegmentModal";
import SegmentsSelect from "@/components/select/SegmentsSelect";
import { AuthContext } from "@/contextes";
import { useDataExport, useIsRouteActive, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchMembersQuery, useUpdateMemberMutation } from "@/store/slices/api/membersSlice";
import { useLazyFetchSegmentsQuery } from "@/store/slices/api/segmentsSlice";
import { APIActionResponse, Member, Segment } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const { isActive } = useIsRouteActive();

  const { hasPermission } = useContext(AuthContext);
  const [memberToGiveProducts, setMemberToGiveProducts] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [segmentId, setSegmentId] = useState<number | undefined>(undefined);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const { display, displaySuccess, displayErrors } = useResponseToastHandler({});

  const [updateMemberMutation] = useUpdateMemberMutation();
  const [exportMembers] = useDataExport();
  const [showModals, setShowModals] = useState<boolean>(false);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [trigger, { data: segments }] = useLazyFetchSegmentsQuery();
  const handleExport = async (tableInstance: any) => {
    exportMembers({
      endpoint: "/members/export",
      name: "members",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const activateAccountHandler = async (member: Member) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("students_flow.activate_student_account"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("students_flow.activate_student_account_description")}
          />
        )
      }))
    ) {
      return;
    }

    const updateMember = (await updateMemberMutation({
      id: member.id,
      status: "active"
    })) as APIActionResponse<Member>;

    if (displayErrors(updateMember)) {
      return;
    }

    displaySuccess(updateMember);
  };

  const deactivateAccountHandler = async (member: Member) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("students_flow.deactivate_student_account"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("students_flow.deactivate_student_account_description")}
          />
        )
      }))
    ) {
      return;
    }

    const updateMember = (await updateMemberMutation({
      id: member.id,
      status: "inactive"
    })) as APIActionResponse<Member>;

    if (displayErrors(updateMember)) {
      return;
    }

    displaySuccess(updateMember);
  };
  const restPasswordHandler = async (member: Member) => {
    const data = (await axios.post(`/members/${member.id}/send-reset-email`, {})) as APIActionResponse<any>;
    display(data);
  };
  const submitHandler = async (products: { id: number; type: string }[]) => {
    if (!memberToGiveProducts) {
      return;
    }

    const response = (await axios.post(`/members/${memberToGiveProducts.id}/grant-access`, {
      products: products
    })) as APIActionResponse<any>;

    if (displayErrors(response)) return;

    displaySuccess(response);
  };

  return (
    <Layout title={t("students_flow.title")}>
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
        <SegmentModal
          open={showModals}
          onDismiss={() => {
            setShowModals(false);
            setSegment(null);
          }}
          segment={segment}
        />
        <AddonController addon="students">
          <Datatable
            columns={{
              columns: MembersCols,
              props: {
                activateAccountHandler,
                deactivateAccountHandler,
                freeProductHandler: (member) => {
                  setMemberToGiveProducts(member);
                  setShowGiftModal(true);
                },
                restPasswordHandler
              } as MembersColumnsProps
            }}
            hasSearch
            renderFilters={(filters) => {
              return (
                <>
                  <FiltersModal filters={filters} />
                  <SegmentsSelect
                    className="lg:min-w-[240px]"
                    isCompact
                    isClearable
                    loadOptions={async (inputValue, callback) => {
                      const { data } = await trigger();
                      if (data?.data) {
                        callback(
                          Object.values(data?.data).map((item) => ({
                            id: item?.id,
                            label: item.name,
                            value: item.id
                          }))
                        );
                      }
                    }}
                    placeholder={t("students_flow.segments.segments_select_placeholder")}
                    isMulti={false}
                    onChange={(segment) => {
                      setSegmentId(segment ? segment.id : undefined);
                    }}
                  />
                </>
              );
            }}
            params={{
              filters: {
                segment_id: segmentId
              }
            }}
            fetcher={useFetchMembersQuery}
            toolbar={(instance) => (
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="md"
                  icon={
                    <Icon
                      size="sm"
                      children={<PlusIcon />}
                    />
                  }
                  onClick={() => setShowModal(true)}
                  children={t("students_flow.add_new_student")}
                />
                {hasPermission("members.export") && (
                  <Dropdown>
                    <Dropdown.Trigger>
                      <Button
                        variant="default"
                        icon={
                          <Icon
                            size="md"
                            children={<EllipsisHorizontalIcon />}
                          />
                        }
                      />
                    </Dropdown.Trigger>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<ArrowDownTrayIcon />}
                          />
                        }
                        children={t("export")}
                        onClick={() => handleExport(instance)}
                      />
                      <Dropdown.Divider />
                      <Dropdown.Item
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<ArrowUpTrayIcon />}
                          />
                        }
                        children={t("students.students_import.modal_title")}
                        onClick={() => setShowImportModal(true)}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            )}
          />
          <StudentImportModal
            open={showImportModal}
            onDismiss={() => {
              setShowImportModal(false);
            }}
          />
          <MemberInformationModal
            open={showModal}
            onDismiss={() => {
              setShowModal(false);
            }}
          />
          <SendProductToMemberModal
            open={showGiftModal}
            submitHandler={submitHandler}
            onDismiss={() => {
              setMemberToGiveProducts(null);
              setShowGiftModal(false);
            }}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
