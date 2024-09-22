import React, { useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { CellProps } from "@/columns";
import { Card, Datatable, EmptyStateTable, Layout, UserAvatar } from "@/components";
import { useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useDeleteCommentMutation,
  useFetchCommentsQuery,
  useReplyCommentMutation,
  useUpdateCommentMutation
} from "@/store/slices/api/commentsSlice";
import { APIActionResponse, Comment, CommentStatus } from "@/types";
import { classNames } from "@/utils";

import { PaperAirplaneIcon, PencilIcon } from "@heroicons/react/24/outline";

import { Avatar, Badge, Button, Form, Icon, Modal, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});
type IFormInputs = {
  content: string;
};

interface CommentItemProps extends React.HTMLAttributes<HTMLDivElement> {
  comment: Comment;
}

const CommentItem = ({ comment: providedComment, ...props }: CommentItemProps) => {
  const { t } = useTranslation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const [comment, setComment] = useState(providedComment);

  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteCommentMutation
  });

  const [updateCommentMutation] = useUpdateCommentMutation();

  const handleUpdateComment = async (comment: Comment) => {
    const status = comment.status == CommentStatus.HIDDEN ? 1 : 0;
    const response = (await updateCommentMutation({
      id: comment.id,
      status: status == 1 ? CommentStatus.SHOWN : CommentStatus.HIDDEN
    })) as APIActionResponse<Comment>;
    if (displayErrors(response)) return;
    displaySuccess(response);
    setComment({
      ...comment,
      status: status == 1 ? CommentStatus.SHOWN : CommentStatus.HIDDEN
    });
  };

  return (
    <div {...props}>
      <div className={classNames("flex items-center gap-x-2", comment?.status == "hidden" ? "opacity-50" : "")}>
        <Avatar
          className={comment?.status == "hidden" ? "opacity-50" : ""}
          imageUrl={comment?.member?.avatar?.url}
          name={comment?.member?.name}
        />
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          className="text-gray-800"
          children={comment?.member?.name}
        />
        {comment.is_admin && (
          <Badge
            variant="default"
            soft
            rounded
            size="sm"
            className="text-gray-800"
            children={t("students.comments.instructor")}
          />
        )}
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          className="text-gray-800"
          children={"•"}
        />

        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          className="text-gray-800"
          // @ts-ignore
          children={dayjs(comment?.created_at).fromNow(true)}
        />
      </div>
      <div className="pr-10">
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          className={classNames("text-gray-800", comment?.status == "hidden" ? "opacity-50" : "")}
          children={comment?.content}
        />

        <div className="mb-9 mt-4 flex gap-2">
          <Button
            onClick={async () => {
              await handleUpdateComment(comment);
            }}
            as="button"
            size="sm"
            outline={comment.status == "shown"}
            variant="default"
            children={comment.status == "shown" ? t("students.comments.hide") : t("students.comments.show")}
          />
          {comment.status == "shown" && (
            <Button
              onClick={() => {
                confirmableDelete({
                  id: comment.id,
                  title: t("students.comments.delete_confirm_title"),
                  children: t("students.comments.delete_confirm_body")
                });
              }}
              as="button"
              size="sm"
              outline
              children={t("students.comments.delete")}
              variant="default"
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);

  const [parentCommentClone, setParentCommentClone] = useState<Comment | null>(null);

  const [replyCommentMutation] = useReplyCommentMutation();

  const schema = yup.object().shape({
    content: yup.string().required().min(3)
  });

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({ mode: "all", resolver: yupResolver(schema) });

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const handleShowReplayModal = (comment: Comment) => {
    setParentCommentClone(comment);
    setShowReplyModal(true);
  };

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting || !parentCommentClone) return;

    const response = (await replyCommentMutation({
      id: parentCommentClone.id,
      ...data,
      content: data.content
    } as Comment)) as APIActionResponse<Comment>;

    if (displayErrors(response)) return;
    if (parentCommentClone) {
      setParentCommentClone({
        ...parentCommentClone,
        replies: [...parentCommentClone.replies, response.data.data]
      });
    }
    displaySuccess(response);
    reset({
      content: ""
    });
  };

  return (
    <Layout title={t("students.comments.title")}>
      <Layout.Container>
        <div className="grid-table comments-table">
          <Datatable
            selectable={false}
            fetcher={useFetchCommentsQuery}
            className="w-full"
            columns={{
              columns: () => [
                {
                  id: "card",
                  Cell: ({ row: { original: comment } }: CellProps<Comment>) => (
                    <Card
                      role="button"
                      className="cursor-pointer rounded-lg hover:shadow-md"
                      onClick={() => handleShowReplayModal(comment)}
                    >
                      <Card.Body>
                        <div className="flex justify-between">
                          <UserAvatar
                            user={comment?.member}
                            isMember={false}
                            className="mb-5"
                          />
                          {comment.status == "hidden" && (
                            <Badge
                              size="sm"
                              rounded
                              outline
                              soft
                              variant="default"
                              className="mb-auto"
                              children={t("students.comments.hidden")}
                            />
                          )}
                        </div>
                        <Title
                          className={`mb-4 rounded-lg bg-gray-100 p-4 ${
                            comment.status == "hidden" ? "opacity-50" : ""
                          }`}
                          reverse
                          title={
                            <>
                              <span className="flex justify-between gap-x-1">
                                <Typography.Paragraph
                                  as="span"
                                  weight="medium"
                                  size="md"
                                  className="truncate"
                                  children={comment?.content}
                                />
                                <Typography.Paragraph
                                  as="span"
                                  weight="medium"
                                  size="md"
                                  className="flex-shrink-0 text-gray-800"
                                  // @ts-ignore
                                  children={dayjs(comment?.created_at).fromNow(false)}
                                />
                              </span>
                            </>
                          }
                        />
                        <div>
                          <Typography.Paragraph
                            as="div"
                            size="sm"
                            className="text-gray-800"
                            children={t(`students.comments.${comment.commentable_type}_title`)}
                          />

                          <div className="flex gap-2">
                            {comment.commentable && (
                              <Typography.Paragraph className="text-underline text-info">
                                <Link
                                  target="_blank"
                                  href={
                                    comment.commentable_type === "article"
                                      ? `/blog/${comment.commentable.id}/edit`
                                      : // @ts-ignore
                                        `/courses/${comment.commentable?.course_id}`
                                  }
                                  children={comment.commentable.title}
                                />
                              </Typography.Paragraph>
                            )}

                            {comment?.replies_count ? (
                              <Badge
                                variant="danger"
                                size="xs"
                                rounded
                                children={comment?.replies_count}
                              />
                            ) : null}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )
                }
              ]
            }}
            emptyState={
              <EmptyStateTable
                title={t("students.comments.empty_state.title")}
                content={t("students.comments.empty_state.description")}
                icon={<PencilIcon />}
              />
            }
            toolbar={() => {}}
            hasFilter={true}
            hasSearch={true}
          />
        </div>
      </Layout.Container>
      <Modal
        size="lg"
        open={showReplyModal}
        onDismiss={() => {
          setShowReplyModal(false);
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle children={t("students.comments.add_replay")} />
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Modal.Content className="max-h-96 overflow-y-auto !pb-0">
              <Typography.Paragraph
                className="mb-2"
                weight="bold"
                size="lg"
                children={parentCommentClone?.commentable?.title}
              />
              <Typography.Paragraph
                className="mb-8 text-gray-950 opacity-30"
                weight="medium"
                size="md"
                children={t("students.comments.total_comments", {
                  count: Number(parentCommentClone?.replies.length) + 1
                })}
              />
              {parentCommentClone && (
                <div className="relative">
                  {parentCommentClone?.replies.length > 0 && (
                    <div className="absolute right-[15px] top-8 z-0 h-[calc(100%_-_152px)] border-r border-dashed border-gray-600 "></div>
                  )}
                  <CommentItem
                    comment={parentCommentClone}
                    className="relative z-10"
                  />
                  {parentCommentClone?.replies.map((child) => (
                    <CommentItem
                      key={child.id}
                      comment={child}
                      className="mr-10"
                    />
                  ))}
                </div>
              )}
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer className="py-3">
            <Form.Group
              required
              className="mb-0 w-full"
              errors={errors.content?.message}
            >
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <>
                    <Form.Input
                      className="rounded-full bg-gray-300"
                      append={
                        <Button
                          disabled={!isDirty || !isValid || isSubmitting}
                          size="sm"
                          className="m-2"
                          rounded
                          type="submit"
                          icon={
                            <Icon className="rotate-180">
                              <PaperAirplaneIcon />
                            </Icon>
                          }
                        />
                      }
                      {...field}
                      placeholder={t("students.comments.add_replay")}
                    />
                  </>
                )}
              />
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}
