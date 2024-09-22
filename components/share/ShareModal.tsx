import React, { FC, useContext, useEffect } from "react";

import { useTranslation } from "next-i18next";

import { FacebookIcon, TwitterIcon } from "@/components/Icons/solid";
import { ShareContext } from "@/components/share/ShareContext";
import { useCopyToClipboard } from "@/hooks";
import { classNames } from "@/utils";

import { DocumentCheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

export type ShareLinkType = {
  label: string;
  url: string;
};

interface ShareModalProps extends ModalProps {
  links: ShareLinkType[];
}

const ShareModal: FC<ShareModalProps> = ({ open = false, links, ...props }: ShareModalProps) => {
  const { setOpen: setShow, open: show } = useContext(ShareContext);
  const [copy, values] = useCopyToClipboard();
  const { t } = useTranslation();
  useEffect(() => {
    setShow(open);
  }, [open]);

  return (
    <Modal
      size="md"
      open={show}
      onDismiss={() => setShow(false)}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("share")} />
      </Modal.Header>

      <Modal.Body>
        <Modal.Content>
          {links.map(({ label, url }, i) => (
            <Form.Group
              key={i}
              label={label}
            >
              <Form.Input
                readOnly
                value={url}
                dir="ltr"
                append={
                  <Button
                    ghost
                    variant="default"
                    onClick={() => copy(url)}
                    icon={
                      <Icon
                        size="sm"
                        className={classNames(values.includes(url) ? "text-success" : "")}
                        children={values.includes(url) ? <DocumentCheckIcon /> : <DocumentDuplicateIcon />}
                      />
                    }
                  />
                }
              />
            </Form.Group>
          ))}

          <div className="space-y-4 rounded bg-gray-100 p-4">
            <Typography.Paragraph
              as="span"
              size="sm"
              weight="normal"
              children={t("share_via_social_media")}
            />
            <div className="flex flex-col space-y-3">
              <Typography.Paragraph
                as="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(links[0]?.url)}`}
                size="md"
                weight="medium"
                className="flex items-center text-primary"
                target="_blank"
              >
                <Icon
                  size="lg"
                  className="ml-2"
                  children={<FacebookIcon />}
                />
                {t("share_on_facebook")}
              </Typography.Paragraph>

              <Typography.Paragraph
                as="a"
                href={`https://twitter.com/intent/tweet?url=${encodeURI(links[0]?.url)}`}
                size="md"
                weight="medium"
                className="flex items-center text-primary"
                target="_blank"
              >
                <Icon
                  size="md"
                  className="ml-2"
                  children={<TwitterIcon />}
                />
                {t("share_on_twitter")}
              </Typography.Paragraph>
            </div>
          </div>
        </Modal.Content>
      </Modal.Body>
    </Modal>
  );
};

export default ShareModal;
