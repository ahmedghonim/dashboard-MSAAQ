import { FC } from "react";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import ReviewsCards from "@/components/shared/ReviewsCards";

import { Typography } from "@msaaqcom/abjad";

const ProductReviewsSection: FC<{
  basePath: "products" | "coaching-sessions" | "courses";
  filters: { [key: string]: any };
  productId: string;
}> = ({ basePath, productId, filters }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-2">
      <Typography.Paragraph
        size="md"
        weight="medium"
        children={t("reviews")}
      />
      <Card>
        <Card.Body>
          <ReviewsCards
            reviewsPath={`/${basePath}/${productId}/reviews`}
            filters={filters}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductReviewsSection;
