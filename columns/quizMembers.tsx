import React from "react";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { UserAvatar } from "@/components";
import Time from "@/components/shared/Time";
import { QuizMember } from "@/types/models/quizMember";

import { Badge, Typography } from "@msaaqcom/abjad";

interface QuizMemberColumnsProps {
  sortables: Array<string>;
}

const QuizMembersCols = ({ sortables = [] }: QuizMemberColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="students_flow.quizzes.members.member">Member</Trans>,
      id: "member",
      accessor: "member",
      disableSortBy: !sortables?.includes("member_id"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="students_flow.quizzes.members.completed_questions">Completed Questions</Trans>,
      id: "completed_questions",
      accessor: "completed_questions",
      disableSortBy: !sortables?.includes("completed_questions"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.completed_questions}
        />
      )
    },
    {
      Header: <Trans i18nKey="students_flow.quizzes.members.correct_answers">Correct Answers</Trans>,
      id: "correct_answers",
      accessor: "correct_answers",
      disableSortBy: !sortables?.includes("correct_answers"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.correct_answers}
        />
      )
    },
    {
      Header: <Trans i18nKey="students_flow.quizzes.members.percent_correct">Percent Correct</Trans>,
      id: "percent_correct",
      accessor: "percent_correct",
      disableSortBy: !sortables?.includes("percent_correct"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => {
        const { t } = useTranslation();
        return (
          <div className={`flex items-center`}>
            <Typography.Paragraph
              as="span"
              size="md"
              weight="medium"
              dir="auto"
              children={`${original.percent_correct}%`}
            />
            <Badge
              variant={original.passed ? "success" : "danger"}
              soft
              rounded
              className="ltr:ml-2 rtl:mr-2"
              size="md"
              children={
                original.passed ? t("students_flow.quizzes.members.passed") : t("students_flow.quizzes.members.failed")
              }
            />
          </div>
        );
      }
    },
    {
      Header: <Trans i18nKey="students_flow.quizzes.members.completed_at">Completed At</Trans>,
      id: "completed_at",
      accessor: "completed_at",
      disableSortBy: !sortables?.includes("completed_at"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => (
        <Time
          className={"text-gray-950"}
          date={original.completed_at}
          format={"DD MMMM YYYY"}
        />
      )
    }
  ];
};

export default QuizMembersCols;
