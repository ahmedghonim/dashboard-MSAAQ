import React, { createContext, useState } from "react";

import ShareModal, { ShareLinkType } from "@/components/share/ShareModal";

export interface ShareContextContextInterface {
  open: boolean;
  setOpen: (open: boolean) => void;
  setLinks: (links: ShareLinkType[]) => void;
}

export const ShareContext = createContext<ShareContextContextInterface>({
  open: false,
  setOpen: () => {},
  setLinks: () => {}
});

export const ShareContextProvider = ({ children }: any) => {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ShareLinkType[]>([]);

  return (
    <ShareContext.Provider value={{ open, setOpen, setLinks }}>
      {children}

      <ShareModal
        open={open}
        links={links}
      />
    </ShareContext.Provider>
  );
};
