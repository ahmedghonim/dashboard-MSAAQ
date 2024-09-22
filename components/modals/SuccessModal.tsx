import React, { FC, useEffect, useState } from "react";

import Image from "next/image";

import { Button, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface SuccessModalProps extends ModalProps {
  title: string;
  description: string;
  actionLink?: string;
  actionLinkLabel?: string;
  shareButtonLabel?: string;
  shareButtonOnClick?: any;
  buttons?: React.ReactNode;
}

const SuccessModal: FC<SuccessModalProps> = ({
  open = false,
  title,
  description,
  actionLink,
  actionLinkLabel,
  shareButtonLabel,
  shareButtonOnClick,
  buttons,
  ...props
}: SuccessModalProps) => {
  const [show, setShow] = useState<boolean>(open);

  useEffect(() => {
    setShow(open);
  }, [open]);

  return (
    <Modal
      size="sm"
      open={show}
      {...props}
    >
      <Modal.Body>
        <Image
          src="/images/success-checked.gif"
          height="200"
          width="200"
          alt="success-checked"
          className="pointer-events-none mx-auto select-none"
        />
        <Modal.Content>
          <div className="flex flex-col items-center space-y-2 text-center">
            <Typography.Paragraph
              weight="medium"
              size="lg"
              children={title}
            />
            <Typography.Paragraph children={description} />
          </div>
          <div className="mt-8 flex flex-col space-y-2">
            {buttons}

            {actionLinkLabel && actionLink && (
              <Button
                as="a"
                variant="primary"
                href={actionLink}
                children={actionLinkLabel}
              />
            )}
            {shareButtonLabel && shareButtonOnClick && (
              <Button
                variant="default"
                onClick={shareButtonOnClick}
                children={shareButtonLabel}
              />
            )}
          </div>
        </Modal.Content>
      </Modal.Body>
    </Modal>
  );
};
export default SuccessModal;
