import React, { FC, PropsWithChildren, useEffect, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Layout, MemberInformationModal } from "@/components";
import SendProductToMemberModal from "@/components/modals/SendProductToMemberModal";
import StudentsSidebar from "@/components/shared/students/StudentsSidebar";
import StudentsTabs from "@/components/shared/students/StudentsTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useFetchMemberQuery, useUnsubscribeMemberMutation } from "@/store/slices/api/membersSlice";
import { APIActionResponse, Member } from "@/types";

interface Props {}

const StudentsBaseLayout: FC<PropsWithChildren<Props>> = ({ children }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const {
    query: { memberId }
  } = router;

  const { data: member = {} as Member } = useFetchMemberQuery(memberId as string);
  const [unsubscribeMemberMutation] = useUnsubscribeMemberMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/students` });
  }, []);

  const submitHandler = async (products: { id: number; type: string }[]) => {
    const response = (await axios.post(`/members/${member.id}/grant-access`, {
      products: products
    })) as APIActionResponse<any>;

    if (displayErrors(response)) return;

    displaySuccess(response);

    //had to handle tags like this because `invalidateTags` does not accept empty string, undefined or null values
    await dispatch(
      apiSlice.util.invalidateTags([
        {
          type: "members.index",
          id: member.id
        },
        ...(products.some((product) => product.type === "course") ? ["enrollments.index"] : []),
        ...(products.some((product) => product.type === "product") ? ["member.downloads.index"] : [])
      ] as any)
    );
  };

  return (
    <Layout title={t("students_flow.student_profile")}>
      <StudentsTabs />
      <Layout.Container>
        <Layout.FormGrid
          sidebar={
            <Layout.FormGrid.DefaultSidebar>
              <StudentsSidebar
                member={member}
                onEdit={() => setShowModal(true)}
                onSendProduct={() => setShowGiftModal(true)}
                onUnsubscribe={() => {
                  unsubscribeMemberMutation(member.id);
                }}
              />
            </Layout.FormGrid.DefaultSidebar>
          }
        >
          {children}
        </Layout.FormGrid>
      </Layout.Container>
      <MemberInformationModal
        open={showModal}
        member={member}
        onDismiss={() => {
          setShowModal(false);
        }}
      />
      <SendProductToMemberModal
        submitHandler={submitHandler}
        open={showGiftModal}
        onDismiss={() => {
          setShowGiftModal(false);
        }}
      />
    </Layout>
  );
};

export default StudentsBaseLayout;
