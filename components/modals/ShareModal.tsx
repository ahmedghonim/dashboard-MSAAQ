import React, { FC, useEffect, useRef, useState } from "react";

import { Trans } from "next-i18next";

import ShareModalBody from "@/components/shared/ShareModalBody";

import { Modal, ModalProps, ModalRef } from "@msaaqcom/abjad";

interface ShareModalProps extends ModalProps {
  productLabel: string;
  productLink: string;
  checkoutLink?: string;
}

const ShareModal: FC<ShareModalProps> = ({
  open = false,
  checkoutLink,
  productLink,
  productLabel,
  ...props
}: ShareModalProps) => {
  const shareModalElRef = useRef<ModalRef>(null);

  const [show, setShow] = useState<boolean>(open);

  useEffect(() => {
    setShow(open);
  }, [open]);

  return (
    <Modal
      ref={shareModalElRef}
      size="md"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle>
          <Trans i18nKey="share">Share</Trans>
        </Modal.HeaderTitle>
      </Modal.Header>
      <Modal.Body>
        <Modal.Content>
          <ShareModalBody
            productLabel={productLabel}
            productLink={productLink}
            checkoutLink={checkoutLink}
          />
        </Modal.Content>
      </Modal.Body>
    </Modal>
  );
};
export default ShareModal;
