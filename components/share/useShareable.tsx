import React, { useContext } from "react";

import { ShareLinkType } from "@/components/share";
import { ShareContext } from "@/components/share/ShareContext";

type ReturnType = (links: ShareLinkType[]) => void;

export const useShareable = (): ReturnType => {
  const { setOpen, setLinks } = useContext(ShareContext);

  return (links: ShareLinkType[]) => {
    setOpen(true);

    setLinks(links);
  };
};
