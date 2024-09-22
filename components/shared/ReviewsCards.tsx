import { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { ReviewCard } from "@/components";
import EmptyData from "@/components/datatable/EmptyData";
import { useFetchReviewsQuery } from "@/store/slices/api/reviewsSlice";
import { APIResponse, Comment } from "@/types";

import { StarIcon } from "@heroicons/react/24/solid";

import { Button } from "@msaaqcom/abjad";

const ReviewsCards: FC<{
  filters: {
    [key: string]: any;
  };
  reviewsPath: string;
}> = ({ filters, reviewsPath }) => {
  const { t } = useTranslation();

  const { data: reviews = {} as APIResponse<Comment>, isLoading: isReviewsLoading } = useFetchReviewsQuery({
    filters: {
      ...filters
    },
    per_page: 1
  });

  return (
    <>
      {isReviewsLoading ||
        (!reviews.data?.length && (
          <EmptyData
            icon={<StarIcon />}
            content={t("no_reviews")}
          />
        ))}
      {!isReviewsLoading && reviews.data.length > 0 && (
        <div className="flex flex-col space-y-4 overflow-y-scroll">
          {reviews.data?.map((comment) => (
            <ReviewCard
              key={comment.id}
              comment={comment}
            />
          ))}
          <Button
            variant="default"
            className="mx-auto"
            as={Link}
            href={reviewsPath}
            children={t("more_reviews")}
          />
        </div>
      )}
    </>
  );
};
export default ReviewsCards;
