import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { useConfirmableDelete } from "@/hooks";
import { useDeleteQuizMutation } from "@/store/slices/api/quizzesSlice";
import { Quiz } from "@/types";

import { SparklesIcon } from "@heroicons/react/20/solid";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface SurveyColumnsProps {
  sortables: Array<string>;
}

const SurveysCols = ({ sortables = [] }: SurveyColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="students_flow.surveys.survey_title">Survey Title</Trans>,
      id: "title",
      accessor: "title",
      disableSortBy: !sortables?.includes("title"),
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Link
          href={`/students/surveys/${original.id}/results`}
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
      Header: <Trans i18nKey="students_flow.surveys.course_title">Course Title</Trans>,
      id: "course_title",
      accessor: "course_title",
      disableSortBy: !sortables?.includes("course_title"),
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Link
          href={`/students/surveys/${original.id}/results`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.course?.title}
          />
        </Link>
      )
    },
    {
      Header: <Trans i18nKey="students_flow.surveys.results_count">Results Count</Trans>,
      id: "results_count",
      accessor: "results_count",
      disableSortBy: !sortables?.includes("results_count"),
      Cell: ({ row: { original } }: CellProps<Quiz>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.results_count}
        />
      )
    },
    {
      Header: <Trans i18nKey="students_flow.surveys.questions_count">Questions Count</Trans>,
      id: "questions_count",
      accessor: "questions_count",
      disableSortBy: !sortables?.includes("questions_count"),
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
              href={`/students/surveys/${original.id}/results`}
              variant="default"
              size="sm"
              className="ml-2 min-w-[110px]"
              children={t("students_flow.surveys.show_results")}
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
                  href={`/students/surveys/${original.id}/results`}
                  children={t("students_flow.surveys.show_results")}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<SparklesIcon />}
                    />
                  }
                />
                {original.course && original.chapter && original.content && (
                  <Dropdown.Item
                    as={Link}
                    href={`/courses/${original.course?.id}/chapters/${original.chapter?.id}/contents/${original.content?.id}/survey/edit`}
                    children={t("students_flow.surveys.edit")}
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<PencilSquareIcon />}
                      />
                    }
                  />
                )}

                <Dropdown.Item
                  children={t("students_flow.surveys.delete_quiz")}
                  className="text-danger"
                  iconAlign="end"
                  onClick={() => {
                    confirmableDelete({
                      id: original?.id,
                      title: t("students_flow.surveys.delete"),
                      label: t("students_flow.surveys.delete_confirm"),
                      children: t("students_flow.surveys.delete_confirmation_text", { title: original.course?.title })
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
  ];
};

export default SurveysCols;
