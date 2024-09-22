import { useState } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { useDeleteCommentMutation } from "@/store/slices/api/commentsSlice";
import { useDeleteReviewMutation, useUpdateReviewMutation } from "@/store/slices/api/reviewsSlice";
import { APIActionResponse, Comment, CommentStatus, Member } from "@/types";
import { classNames } from "@/utils";

import {
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Dropdown, Icon, Title, Typography } from "@msaaqcom/abjad";

import ReviewReplyModal from "../modals/ReviewReplyModal";

const UserWithContent = ({ user, content }: { user: Member; content: string }) => {
  return (
    <div className="flex gap-4">
      <Avatar
        className="h-10 w-10 flex-shrink-0"
        imageUrl={user?.avatar?.url}
        name={user.name}
      />
      <div>
        <Typography.Paragraph
          size="md"
          children={user.name}
        />
        {content && (
          <Typography.Paragraph
            className="text-gray-800"
            size="md"
            children={content}
          />
        )}
      </div>
    </div>
  );
};
const ReviewCard = ({ comment: providedComment }: { comment: Comment }) => {
  const [comment, setComment] = useState(providedComment);

  const [showModal, setShowModal] = useState(false);
  const [currentReview, setCurrentReview] = useState<Comment | null>(null);

  const handleReply = (comment: Comment) => {
    setCurrentReview(comment);
    setShowModal(true);
  };

  const { t } = useTranslation();
  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteReviewMutation
  });
  const [confirmableDeleteComment] = useConfirmableDelete({
    mutation: useDeleteCommentMutation
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const [updateCommentMutation] = useUpdateReviewMutation();
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

  const handleCommentChange = (currentComment: Comment) => {
    setComment({
      ...currentComment
    });
  };
  return (
    <>
      <Card className="h-full">
        <Card.Body className="flex h-full flex-col justify-between">
          <Title
            className={classNames("mb-4", comment.status == "hidden" ? "opacity-50" : "")}
            reverse
            title={
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-between gap-x-2">
                  <Link
                    href={comment.commentable?.url ?? "#"}
                    target="_blank"
                    className="text-blue-500"
                  >
                    {comment.commentable?.title}
                  </Link>
                  <Typography.Paragraph
                    as="span"
                    weight="medium"
                    size="md"
                    className="text-gray-700"
                    // @ts-ignore
                    children={`. ${dayjs(comment?.created_at).fromNow(false)}`}
                  />
                </span>
                <Badge
                  rounded
                  varient="default"
                  soft
                  outline
                  children={
                    <div className="mr-auto flex items-center gap-1">
                      <Icon
                        size="sm"
                        className="text-secondary"
                      >
                        <StarIcon />
                      </Icon>
                      <Typography.Paragraph
                        className="text-black"
                        weight="medium"
                        size="lg"
                        children={comment?.rating?.toFixed(1)}
                      />
                    </div>
                  }
                />
              </div>
            }
          />
          <div className="mb-4 flex flex-col">
            {comment?.member && (
              <UserWithContent
                content={comment.content ?? t("courses.reviews.no_comment")}
                user={comment?.member as Member}
              />
            )}
          </div>

          {comment.children.length > 0 && (
            <div className="mb-4 rounded-xl bg-gray-100 p-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-x-2 ">
                  <Typography.Paragraph
                    as="span"
                    weight="medium"
                    size="md"
                    children={t("courses.reviews.your_reply")}
                  />
                  <Typography.Paragraph
                    as="span"
                    weight="medium"
                    size="md"
                    className="text-gray-700"
                    // @ts-ignore
                    children={`. ${dayjs(comment?.created_at).fromNow(false)}`}
                  />
                </div>
                <Dropdown>
                  <Dropdown.Trigger>
                    <Button
                      variant="default"
                      size="sm"
                      icon={
                        <Icon
                          size="md"
                          children={<Cog6ToothIcon />}
                        />
                      }
                    />
                  </Dropdown.Trigger>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => handleReply(comment)}
                      children={t("edit")}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<PencilSquareIcon />}
                        />
                      }
                    />
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => {
                        confirmableDeleteComment({
                          id: comment.children[0].id,
                          title: t("courses.reviews.delete_confirm_title_comment"),
                          children: t("courses.reviews.delete_confirm_body_comment"),
                          callback: () => {
                            handleCommentChange({
                              ...comment,
                              children: []
                            });
                          }
                        });
                      }}
                      children={t("delete")}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<TrashIcon />}
                        />
                      }
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              {comment?.children[0] && <div>{comment?.children[0].content}</div>}
            </div>
          )}
          <hr className="mb-4" />

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => handleReply(comment)}
              as="button"
              size="sm"
              disabled={comment.children.length > 0}
              children={t("courses.reviews.add_replay")}
              variant="primary"
            />
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
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleUpdateComment(comment)}
                  children={comment.status == "shown" ? t("courses.reviews.hide") : t("courses.reviews.show")}
                  icon={<Icon>{comment.status == "shown" ? <EyeSlashIcon /> : <EyeIcon />}</Icon>}
                  iconAlign="end"
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => {
                    confirmableDelete({
                      id: comment.id,
                      title: t("courses.reviews.delete_confirm_title"),
                      children: t("courses.reviews.delete_confirm_body"),
                      callback: () => {
                        handleCommentChange({
                          ...comment,
                          children: []
                        });
                      }
                    });
                  }}
                  children={t("delete")}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<TrashIcon />}
                    />
                  }
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </Card>
      <ReviewReplyModal
        open={showModal}
        comment={currentReview}
        onCommentChange={handleCommentChange}
        onDismiss={() => {
          setShowModal(false);
          setCurrentReview(null);
        }}
      />
    </>
  );
};

export default ReviewCard;
