import { FC, HTMLAttributes, ReactNode } from "react";

import { useTranslation } from "next-i18next";

import { useCopyToClipboard } from "@/hooks";
import { classNames } from "@/utils";

import { Avatar, Badge, Title, Tooltip } from "@msaaqcom/abjad";

interface CardAuthorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  newsletter_subscribed?: boolean;
}

const CardAuthor: FC<CardAuthorProps & { title?: string; subtitle?: string; avatar?: string }> = ({
  children,
  title,
  subtitle,
  avatar,
  newsletter_subscribed,
  className
}) => {
  const { t } = useTranslation();
  const [copy, values] = useCopyToClipboard();

  return (
    <div className={classNames("flex w-full justify-between", className)}>
      <Title
        className="w-full"
        prepend={
          <>
            <Avatar
              className="flex-shrink-0"
              imageUrl={avatar}
              name={title ?? ""}
            />
          </>
        }
        title={
          <div className="flex w-full">
            {title}
            {newsletter_subscribed && (
              <Badge
                variant="success"
                className="ms-auto flex-shrink-0"
                size="sm"
                soft
                children={t("students_flow.subscribed")}
              />
            )}
          </div>
        }
        subtitle={
          <Tooltip
            // @ts-ignore
            placement="bottom-center"
          >
            <Tooltip.Trigger>
              <div
                className="cursor-pointer select-none"
                onClick={() => copy(subtitle as string)}
              >
                {subtitle}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>{values.includes(subtitle as string) ? t("copied") : t("copy")}</Tooltip.Content>
          </Tooltip>
        }
      />
      {children}
    </div>
  );
};

type CardAuthor<P = {}> = FC<P>;
export default CardAuthor as CardAuthor<CardAuthorProps & { title?: string; subtitle?: string; avatar?: string }>;
