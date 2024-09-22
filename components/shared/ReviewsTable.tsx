import { useTranslation } from "next-i18next";

import { Datatable, EmptyStateTable, ReviewCard } from "@/components";
import { useFetchReviewsQuery } from "@/store/slices/api/reviewsSlice";

import { PencilIcon } from "@heroicons/react/24/outline";

interface Props {
  filters?: {
    [key: string]: any;
  };
}

const ReviewsTable = ({ filters }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="grid-table comments-table">
      <Datatable
        selectable={false}
        fetcher={useFetchReviewsQuery}
        params={{
          filters: {
            ...filters
          }
        }}
        className="w-full"
        columns={{
          columns: () => [
            {
              id: "card",
              Cell: ({ row: { original } }: any) => <ReviewCard comment={original} />
            }
          ]
        }}
        emptyState={
          <EmptyStateTable
            title={t("courses.reviews.empty_state.title")}
            content={t("courses.reviews.empty_state.description")}
            icon={<PencilIcon />}
          />
        }
        toolbar={() => {}}
        hasFilter={true}
        hasSearch={true}
      />
    </div>
  );
};
export default ReviewsTable;
