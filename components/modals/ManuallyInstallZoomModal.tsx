import React, { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { FreshchatContext } from "@/contextes";

import { Button, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

const ManuallyInstallZoomModal = ({ open = false, ...props }: ModalProps) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    setShow(open);
  }, [open]);

  const { openChat } = useContext(FreshchatContext);

  return (
    <Modal
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("apps_marketplace.zoom_modal.title")} />
      </Modal.Header>
      <Modal.Content>
        <Modal.Body>
          <Typography.Paragraph
            size="lg"
            weight="medium"
            className="text-gray-700"
            children={t("apps_marketplace.zoom_modal.description")}
          />
        </Modal.Body>
      </Modal.Content>
      <Modal.Footer>
        <Button
          size="lg"
          className="ml-2"
          as="a"
          href="https://www.loom.com/share/cd11eb572d4d46bebf6964735fc7ad6c"
          target="_blank"
          rel="noopener noreferrer"
          children={t("apps_marketplace.zoom_modal.watch_video")}
        />
        <Button
          ghost
          size="lg"
          variant="dismiss"
          onClick={() => {
            openChat();

            props.onDismiss && props.onDismiss();
          }}
          children={t("apps_marketplace.zoom_modal.contact_support")}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ManuallyInstallZoomModal;
