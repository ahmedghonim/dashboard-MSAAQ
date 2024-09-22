import { FC } from "react";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Member } from "@/types";

import { BanknotesIcon, BellSlashIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Title } from "@msaaqcom/abjad";

interface StudentsSidebarProps {
  onEdit: () => void;
  onSendProduct: () => void;
  onUnsubscribe: () => void;
  member: Member;
}

const StudentsSidebar: FC<StudentsSidebarProps> = ({ onEdit, onSendProduct, onUnsubscribe, member }) => {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice();

  return (
    <Card>
      <Card.Body>
        <div className="flex items-center justify-between">
          <Card.Author
            title={member.name}
            subtitle={member.email ?? member.international_phone}
            avatar={member.avatar?.url}
            newsletter_subscribed={member.newsletter_status == "subscribed"}
          />
        </div>
        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex items-center">
            <div className="bg-black/2 ml-4 rounded-full p-2">
              <Icon
                size="md"
                className="text-gray-800"
                children={<BanknotesIcon />}
              />
            </div>
            <Title
              reverse
              title={member?.total_purchases ? formatPrice(member?.total_purchases ?? 0) : "—"}
              subtitle={t("students_flow.total_purchases")}
            />
          </div>
          <div className="flex items-center">
            <div className="bg-black/2 ml-4 rounded-full p-2">
              <Icon
                size="md"
                className="text-gray-800"
                children={<VideoCameraIcon />}
              />
            </div>
            <Title
              reverse
              title={
                member?.products_count || member?.courses_count
                  ? t("courses_count_and_products_count", {
                      products_count: member?.products_count,
                      courses_count: member?.courses_count
                    })
                  : "—"
              }
              subtitle={t("students_flow.purchased_products")}
            />
          </div>
        </div>
      </Card.Body>
      <Card.Actions className="flex-col space-y-2">
        <Button
          variant="primary"
          className="w-full"
          size="lg"
          children={t("students_flow.edit")}
          onClick={onEdit}
        />
        <Button
          variant="default"
          className="w-full"
          size="lg"
          children={t("students_flow.send_gift")}
          onClick={onSendProduct}
        />
        <Button
          variant="default"
          className="w-full"
          icon={
            <Icon
              size="md"
              children={<BellSlashIcon />}
            />
          }
          size="lg"
          children={t("students_flow.unSubscribe")}
          onClick={onUnsubscribe}
        />
      </Card.Actions>
    </Card>
  );
};

export default StudentsSidebar;
