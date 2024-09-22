import React, { FC, ReactNode, useMemo } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Course, Product } from "@/types";
import { formatDate } from "@/utils";

import { EllipsisHorizontalIcon, EyeIcon, NoSymbolIcon } from "@heroicons/react/24/outline";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface StudentsSidebarProps {
  children?: ReactNode;
  enrollment_at?: string;
  product: Course | Product;
  removeProductAccessHandler: () => Promise<void>;
}

const StudentProduct: FC<StudentsSidebarProps> = ({ children, removeProductAccessHandler, product, enrollment_at }) => {
  const { t } = useTranslation();
  const isCourse = useMemo(() => product.hasOwnProperty("certification"), [product]);

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <Typography.Paragraph
            className="text-success"
            size="md"
            weight="medium"
            children={product.title}
          />
          <Typography.Paragraph
            as="time"
            className="text-gray-800"
            children={t(isCourse ? "students_flow.joined_since" : "products.purchased_since", {
              date: formatDate(enrollment_at ?? product.created_at)
            })}
          />
        </div>
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
              href={isCourse ? `/courses/${product.id}` : `/products/${product.id}`}
              children={isCourse ? t("students_flow.view_course") : t("students_flow.view_product")}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<EyeIcon />}
                />
              }
            />
            <Dropdown.Divider />
            <Dropdown.Item
              children={
                isCourse ? t("students_flow.remove_access_to_course") : t("students_flow.remove_access_to_product")
              }
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  className="mr-6"
                  children={<NoSymbolIcon />}
                />
              }
              onClick={() => removeProductAccessHandler()}
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {children}
    </>
  );
};

export default StudentProduct;
