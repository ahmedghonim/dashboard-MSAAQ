import React, { FC, ReactNode } from "react";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { CourseStats, ProductStats } from "@/types";

import { Icon, Title, Typography } from "@msaaqcom/abjad";

const ProductStatsCard: FC<{
  className?: string;
  stats: ProductStats | CourseStats;
  statsItems: Array<{
    icon: ReactNode;
    title: string;
    data: {
      key: string | number;
      value: string | number;
    };
  }>;
}> = ({ className, statsItems }) => {
  const { t } = useTranslation();

  return (
    <Card className={className}>
      <Card.Header>
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          children={t("stats")}
        />
      </Card.Header>
      <Card.Body className="flex flex-col space-y-4">
        {statsItems.map((item, index) => (
          <Card key={index}>
            <Card.Body>
              <div className="mb-2 flex items-center">
                <Icon
                  size="md"
                  className="ml-2 text-gray-900"
                >
                  {item.icon}
                </Icon>
                <Title title={item.title} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Typography.Paragraph
                    size="md"
                    weight="medium"
                  >
                    {item.data.value}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    size="md"
                    weight="medium"
                    className="mr-2 text-gray-800"
                  >
                    {item.data.key}
                  </Typography.Paragraph>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </Card.Body>
    </Card>
  );
};
export default ProductStatsCard;
