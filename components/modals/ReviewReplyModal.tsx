import { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { useDeleteCommentMutation, useUpdateCommentMutation } from "@/store/slices/api/commentsSlice";
import { useReviewReplyMutation } from "@/store/slices/api/reviewsSlice";
import { APIActionResponse, Comment, CommentStatus, Member } from "@/types";
import { classNames } from "@/utils";

import { StarIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Form, Icon, Modal, ModalProps, Title, Typography } from "@msaaqcom/abjad";

import { Card } from "../cards";
import { UserAvatar } from "../user-avatar";

interface IFormInputs {
  content: string;
}
interface ReviewReplyProps extends ModalProps {
  comment: Comment | null;
  status?: CommentStatus;
  onCommentChange: (comment: Comment) => void;
}

const ReviewReplyModal: FC<ReviewReplyProps> = ({ open, onDismiss, comment, onCommentChange }) => {
  const { t } = useTranslation();

  const [replyValue, setReplyValue] = useState<Comment | null>(null);

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(open ?? false);
    if (comment?.children[0] as Comment) {
      setReplyValue(comment?.children[0] as Comment);
    }
  }, [open]);

  const schema = yup.object().shape({
    content: yup.string().required().min(3)
  });

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({ mode: "onChange", resolver: yupResolver(schema) });

  useEffect(() => {
    if (replyValue) {
      reset({
        content: replyValue.content
      });
    }
  }, [replyValue]);

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const [updateCommentMutation] = useUpdateCommentMutation();
  const [replyReviewMutation] = useReviewReplyMutation();

  useEffect(() => {
    if (comment && comment?.children?.length == 0) {
      reset({ content: "" });
    }
  }, [comment]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting || !comment) return;
    const mutation = replyValue ? updateCommentMutation : replyReviewMutation;

    const response = (await mutation({
      id: replyValue ? replyValue.id : comment.id,
      ...data
    } as Comment)) as APIActionResponse<Comment>;

    if (displayErrors(response)) return;
    displaySuccess(response);
    onDismiss?.();
    setReplyValue(response.data.data);
    reset({
      content: response.data.data.content
    });
    onCommentChange({
      ...comment,
      children: [
        {
          ...response.data.data,
          content: response.data.data.content
        }
      ]
    });
  };
  return (
    comment && (
      <Modal
        size="lg"
        open={show}
        onDismiss={() => {
          onDismiss?.();
          setReplyValue(null);
          reset({ content: "" });
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle
            children={replyValue ? t("courses.reviews.update_replay") : t("courses.reviews.add_replay")}
          />
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Modal.Content className="max-h-fit overflow-y-auto !pb-0">
              <Card className="mb-6">
                <Card.Body>
                  <div className="flex justify-between">
                    {comment?.member && (
                      <UserAvatar
                        user={comment?.member as Member}
                        isMember={true}
                        className="mb-4"
                      />
                    )}
                  </div>

                  <Title
                    className={classNames("mb-4", comment.status == "hidden" ? "opacity-50" : "")}
                    reverse
                    title={
                      <>
                        <span className="flex items-center justify-between gap-x-1">
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
                          <Typography.Paragraph
                            as="span"
                            weight="medium"
                            size="md"
                            className="text-gray-700"
                            // @ts-ignore
                            children={dayjs(comment?.created_at).fromNow(false)}
                          />
                        </span>
                      </>
                    }
                  />
                  <Typography.Paragraph
                    className={classNames("mb-2 mt-2", comment.status == "hidden" ? "opacity-50" : "")}
                    size="md"
                    weight="medium"
                    children={comment.title}
                  />
                  <Typography.Paragraph
                    className={classNames("mb-4 text-gray-800", comment.status == "hidden" ? "opacity-50" : "")}
                    size="md"
                    weight="medium"
                    children={comment.content ?? t("courses.reviews.no_comment")}
                  />
                </Card.Body>
              </Card>
              <Form.Group
                className="mb-4"
                label={replyValue ? t("courses.reviews.update_replay") : t("courses.reviews.add_replay")}
                errors={errors.content?.message}
              >
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <Form.Textarea
                      disabled={replyValue?.status == "hidden"}
                      placeholder={t("courses.reviews.replay_content_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer className="py-3">
            <Button
              size="lg"
              className="ml-2"
              type="submit"
              children={replyValue ? t("courses.reviews.save_changes") : t("courses.reviews.add_replay")}
              disabled={!isDirty || !isValid || isSubmitting}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              onClick={() => {
                onDismiss?.();
              }}
              children={t("cancel")}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    )
  );
};

export default ReviewReplyModal;
