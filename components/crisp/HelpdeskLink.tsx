import React, { HTMLProps, useMemo } from "react";

import { useRouter } from "next/router";

interface Props extends HTMLProps<HTMLAnchorElement> {
  slug: string;
}

export const HelpdeskLink = ({ slug: providedSlug, onClick, href, target, ...props }: Props) => {
  const router = useRouter();
  const { locale } = router;
  const slug = useMemo(() => providedSlug?.split("-").pop(), [providedSlug]);

  return (
    <a
      href={`https://msaaq.crisp.help/${locale}/article/${slug}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        e.preventDefault();

        // window.$crisp.push(["do", "helpdesk:article:open", [locale, slug]]);

        onClick?.(e);
      }}
      {...props}
    />
  );
};
