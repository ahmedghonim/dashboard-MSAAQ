import { useEffect } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout, Time, UserAvatar } from "@/components";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchAssignmentMemberQuery,
  useUpdateAssignmentMemberMutation
} from "@/store/slices/api/assignmentsMemberSlice";
import { APIActionResponse, AssignmentMember, AssignmentMemberStatus } from "@/types";
import { classNames, getStatusColor } from "@/utils";

import { Alert, Avatar, Badge, Button, Form, Title, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  status: "accepted" | "rejected";
  notes: string;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [updateAssignmentMemberMutation] = useUpdateAssignmentMemberMutation();

  const {
    data: assignmentMember = {} as AssignmentMember,
    refetch,
    isLoading
  } = useFetchAssignmentMemberQuery(router.query.assignmentMemberId as any);

  const schema = yup.object().shape({
    status: yup.string().required(),
    notes: yup.string().required()
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    setValue
  } = useForm<IFormInputs>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });
  const { display } = useResponseToastHandler({ setError });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/students/assignments" });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: assignmentMember?.assignment?.title ?? "" });
  }, [assignmentMember]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedAssignmentMember = (await updateAssignmentMemberMutation({
      id: assignmentMember.id,
      ...data
    })) as APIActionResponse<AssignmentMember>;

    display(updatedAssignmentMember);

    await refetch();
  };
  const RenderSidebar = () => {
    return !isLoading ? (
      assignmentMember.status === AssignmentMemberStatus.PROCESSING ? (
        <Layout.FormGrid.DefaultSidebar>
          <Card className="bg-gray-100">
            <Card.Body>
              <Form.Group
                label={t("assignments.leave_note")}
                className="mb-0"
                errors={errors.notes?.message}
              >
                <Controller
                  render={({ field }) => (
                    <Form.Textarea
                      rows={8}
                      {...field}
                    />
                  )}
                  name={"notes"}
                  control={control}
                />
              </Form.Group>
            </Card.Body>
            <Card.Actions className="flex flex-col gap-2 bg-white">
              <Button
                size="lg"
                children={t("assignments.accept")}
                className="w-full"
                onClick={() => {
                  setValue("status", "accepted");
                  handleSubmit(onSubmit)();
                }}
              />
              <Button
                variant="default"
                size="lg"
                children={t("assignments.reject")}
                className="w-full"
                onClick={() => {
                  setValue("status", "rejected");
                  handleSubmit(onSubmit)();
                }}
              />
            </Card.Actions>
          </Card>
        </Layout.FormGrid.DefaultSidebar>
      ) : (
        <Layout.FormGrid.DefaultSidebar>
          <Alert
            variant={assignmentMember.status === AssignmentMemberStatus.ACCEPTED ? "success" : "info"}
            title={t(`assignments.alert_title.${assignmentMember.status}`)}
            children={t(`assignments.alert_description.${assignmentMember.status}`)}
          />
        </Layout.FormGrid.DefaultSidebar>
      )
    ) : (
      <Layout.FormGrid.DefaultSidebar>{null}</Layout.FormGrid.DefaultSidebar>
    );
  };

  return (
    <Layout title={assignmentMember?.assignment?.title}>
      <Layout.Container>
        <Layout.FormGrid sidebar={RenderSidebar()}>
          <div className="flex flex-col gap-4">
            <Card label={t("assignments.assignment_details")}>
              <Card.Body>
                <div className="mb-8 flex justify-between">
                  <div className="flex items-center gap-2">
                    <Typography.Subtitle
                      size="sm"
                      children={assignmentMember?.assignment?.title}
                    />
                    <Badge
                      size="sm"
                      variant={getStatusColor(assignmentMember?.status)}
                      children={<Trans i18nKey={`assignments.statuses.${assignmentMember.status}`} />}
                      rounded
                      soft
                    />
                  </div>
                  <Button
                    as="a"
                    href={assignmentMember?.attachment}
                    target="_blank"
                    download={assignmentMember?.assignment?.file}
                    children={t("assignments.download_assignment")}
                  />
                </div>
                <div className="flex flex-col divide-y divide-gray-300 [&>:first-child]:pb-8 [&>:last-child]:pt-8 [&>:not(:first-child):not(:last-child)]:py-8">
                  <div className="card-divide-x grid grid-cols-2">
                    <Title
                      reverse
                      title={assignmentMember?.course?.title}
                      subtitle={t("assignments.for_course")}
                    />
                    <Title
                      reverse
                      title={assignmentMember?.assignment?.title ?? "-"}
                      subtitle={t("assignments.for_chapter")}
                    />
                  </div>
                  <div className="card-divide-x grid grid-cols-2">
                    <Title
                      prepend={
                        <Avatar
                          imageUrl={assignmentMember?.member?.avatar?.url}
                          name={assignmentMember?.member?.name}
                        />
                      }
                      title={
                        <>
                          <div className="flex items-center gap-2">
                            <Typography.Paragraph
                              className="text-gray-950"
                              children={assignmentMember?.member?.name}
                              weight="medium"
                            />
                            <Badge
                              size="sm"
                              variant="default"
                              children={t("the_student")}
                              rounded
                              soft
                            />
                          </div>
                        </>
                      }
                      subtitle={assignmentMember?.member?.email}
                    />
                    <Title
                      reverse
                      title={
                        <Time
                          date={assignmentMember?.created_at}
                          format={"D MMM YYYY. h:mmA"}
                        />
                      }
                      subtitle={t("assignments.submitted_at")}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
            <div className="flex flex-col space-y-8">
              {assignmentMember?.activities?.map((activity, index) => (
                <Card
                  key={activity.id}
                  {...(index === 0 && { label: t("assignments.activities") })}
                  className={classNames(
                    "relative after:absolute after:-bottom-8 after:right-8 after:h-8 after:w-px after:-translate-x-2/4 after:content-['']",
                    index !== assignmentMember.activities.length - 1 && "tl-bg"
                  )}
                >
                  <Card.Body className="flex flex-col space-y-6">
                    <div className="flex justify-between">
                      <UserAvatar user={activity.causer} />
                      <Typography.Paragraph
                        as="span"
                        size="sm"
                        weight="normal"
                        className="text-gray-800"
                        children={
                          <Time
                            date={activity?.created_at}
                            format={"D MMM YYYY. h:mmA"}
                          />
                        }
                      />
                    </div>
                    <div className="flex flex-col items-start space-y-3 pr-8">
                      <Badge
                        variant={
                          activity?.status === AssignmentMemberStatus.PROCESSING
                            ? "purple"
                            : getStatusColor(activity?.status)
                        }
                        {...(activity?.status === AssignmentMemberStatus.PROCESSING ? { soft: false } : { soft: true })}
                        rounded
                        children={<Trans i18nKey={`assignments.statuses.${activity?.status}`} />}
                      />
                      {activity.causer.type == "member"
                        ? activity.message && (
                            <div className="w-fit rounded bg-gray-200 p-4">
                              <Typography.Paragraph>{activity.message}</Typography.Paragraph>
                            </div>
                          )
                        : activity.notes && (
                            <div className="w-fit rounded bg-gray-200 p-4">
                              <Typography.Paragraph>{activity.notes}</Typography.Paragraph>
                            </div>
                          )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </Layout.FormGrid>
      </Layout.Container>
    </Layout>
  );
}
