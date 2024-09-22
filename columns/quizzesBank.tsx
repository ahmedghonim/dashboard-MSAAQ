import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useConfirmableDelete } from "@/hooks";
import { useDeleteQuizMutation } from "@/store/slices/api/quizzesSlice";
import { Quiz } from "@/types";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface QuizColumnsProps {
  sortables: Array<string>;
  columns: Array<string>;
}

const QuizBankCols = ({ sortables = [], columns = [] }: QuizColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="quizzes.bank.quiz_title">Title</Trans>,
      id: "title",
      accessor: "title",
      disableSortBy: !sortables?.includes("title"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Link
          href={`/quizzes/bank/${original.id}`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.title}
          />
        </Link>
      )
    },
    {
      Header: <Trans i18nKey="quizzes.bank.questions_count">Questions count</Trans>,
      id: "questions_count",
      accessor: "questions_count",
      disableSortBy: !sortables?.includes("questions_count"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.questions_count}
        />
      )
    },
    {
      Header: <Trans i18nKey="quizzes.bank.created_at">Created At</Trans>,
      id: "created_at",
      accessor: "created_at",
      disableSortBy: !sortables?.includes("created_at"),
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Time
          className={"text-gray-950"}
          date={original.created_at}
          format={"DD MMMM YYYY"}
        />
      )
    },

    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Quiz>) => {
        const { t } = useTranslation();
        const [confirmableDelete] = useConfirmableDelete({
          mutation: useDeleteQuizMutation
        });

        return (
          <div className="flex flex-row">
            <Button
              as={Link}
              href={`/quizzes/bank/${original.id}`}
              variant="default"
              size="sm"
              className="ml-2"
              children={<Trans i18nKey="quizzes.bank.preview_questions">Preview questions</Trans>}
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
                  as={Link}
                  href={`/quizzes/bank/${original.id}/questions`}
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
                  children={t("quizzes.bank.delete_quiz")}
                  className="text-danger"
                  iconAlign="end"
                  onClick={() => {
                    confirmableDelete({
                      id: original.id,
                      title: t("quizzes.bank.delete_quiz"),
                      label: t("quizzes.bank.delete_quiz_confirm"),
                      children: t("quizzes.bank.delete_quiz_confirm_message", { label: original.title })
                    });
                  }}
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

export default QuizBankCols;
