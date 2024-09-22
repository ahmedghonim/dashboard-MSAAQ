import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { confirm as confirmDelete } from "@/components/Alerts/Confirm";
import { useResponseToastHandler } from "@/hooks";
import { useDeleteQuestionMutation } from "@/store/slices/api/questionsSlice";
import { APIActionResponse, Quiz } from "@/types";
import { stripHtmlTags } from "@/utils";

import { TrashIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

interface QuestionsColumnsProps {
  sortables: Array<string>;
  columns: Array<string>;
  quizId: number | string;
}

const QuestionsCols = ({ sortables = [], columns = [], quizId }: QuestionsColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="quiz.question.question_title">Title</Trans>,
      id: "title",
      accessor: "title",
      disableSortBy: !sortables?.includes("title"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Link
          href={`/quizzes/bank/${quizId}/questions/${original.id}/edit`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={stripHtmlTags(original.title)}
          />
        </Link>
      )
    },

    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Quiz>) => {
        const { t } = useTranslation();
        const [deleteQuestionMutation] = useDeleteQuestionMutation();
        const { displayErrors, displaySuccess } = useResponseToastHandler({});

        const onQuestionRemove = async (question: any) => {
          if (
            await confirmDelete({
              children: t("quiz.question.delete_question_confirmation", {
                title: stripHtmlTags(question.title).split(" ").slice(0, 3).join(" ")
              }),
              title: t("quiz.question.delete_question"),
              okLabel: t("confirm_delete"),
              cancelLabel: t("cancel"),
              variant: "danger"
            })
          ) {
            const deleteQuestion = (await deleteQuestionMutation({
              quizId,
              id: question.id as any
            })) as APIActionResponse<any>;

            if (displayErrors(deleteQuestion)) return;
            else {
              displaySuccess(deleteQuestion);
            }
          }
        };

        return (
          <div className="flex flex-row">
            <Button
              variant="default"
              size="sm"
              className="ml-2"
              icon={
                <Icon>
                  <TrashIcon />
                </Icon>
              }
              onClick={() => {
                onQuestionRemove(original);
              }}
            />
          </div>
        );
      }
    }
  ]
    .filter((col) => {
      if (columns.length) {
        return columns.includes(col.id);
      }

      return true;
    })
    .sort((a, b) => {
      return columns.indexOf(a.id) - columns.indexOf(b.id);
    });

export default QuestionsCols;
