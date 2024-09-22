import { orderBy } from "lodash";
import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { UserAvatar } from "@/components";
import Time from "@/components/shared/Time";
import { Question } from "@/types";
import { QuizMember } from "@/types/models/quizMember";
import { SurveyMember } from "@/types/models/surveyMember";

interface SurveyMemberColumnsProps {
  sortables: Array<string>;
  questions: Array<Question>;
}

const SurveyMembersCols = ({ sortables = [], questions }: SurveyMemberColumnsProps) => {
  const items = [
    {
      Header: <Trans i18nKey="students_flow.surveys.members.member">Member</Trans>,
      id: "member",
      accessor: "member",
      width: 250,
      disableSortBy: !sortables?.includes("member_id"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="students_flow.surveys.members.completed_at">Completed At</Trans>,
      id: "completed_at",
      accessor: "completed_at",
      width: 250,
      disableSortBy: !sortables?.includes("completed_at"),
      Cell: ({ row: { original } }: CellProps<QuizMember>) => (
        <Time
          className={"text-gray-950"}
          date={original.completed_at}
          format={"DD MMMM YYYY"}
        />
      )
    },
    ...(orderBy(questions, ["id"], ["asc"])?.map((question) => ({
      Header: question.title,
      id: question.id,
      accessor: "questions",
      width: 200,
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<SurveyMember>) => {
        const correctAnswer = original.answers.find((answer) => answer.question_id === question.id);

        return <span className="text-gray-950">{correctAnswer ? correctAnswer.content : "لا يوجد جواب"}</span>;
      }
    })) || [])
  ];

  return items;
};

export default SurveyMembersCols;
