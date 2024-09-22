import React, { FC, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { EmptyState, EmptyStateProps } from "@/components";
import { useDynamicSearchParams } from "@/hooks";

import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

import { Button, Icon } from "@msaaqcom/abjad";

const EmptyStateTable: FC<EmptyStateProps> = ({
  title: providedTitle,
  content: providedContent,
  children,
  icon,
  ...props
}) => {
  const router = useRouter();
  const { search, filters } = router.query;
  const [title, setTitle] = useState<string | undefined>(providedTitle);
  const [content, setContent] = useState<string | undefined>(providedContent);
  const { t } = useTranslation();
  const searchParams = useDynamicSearchParams();

  useEffect(() => {
    if (search || filters) {
      setTitle(t("empty_state.no_results_found_title"));
      setContent(t("empty_state.no_results_found_description"));
    } else {
      setTitle(providedTitle);
      setContent(providedContent);
    }

    return () => {
      setTitle(providedTitle);
      setContent(providedContent);
    };
  }, [providedTitle, providedContent, search, filters]);

  return (
    <EmptyState
      title={title}
      content={content}
      className="min-h-[theme(spacing.64)]"
      icon={
        search || filters ? (
          <Icon
            children={<MagnifyingGlassCircleIcon />}
            className="h-12 w-12 text-gray-600"
          />
        ) : (
          icon
        )
      }
      {...props}
    >
      {search || filters ? (
        <Button
          variant="default"
          children={t("empty_state.no_results_found_button")}
          onClick={() => searchParams.clear()}
        />
      ) : (
        children
      )}
    </EmptyState>
  );
};

export default EmptyStateTable;
