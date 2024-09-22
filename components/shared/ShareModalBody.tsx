import React, { FC } from "react";

import { Trans, useTranslation } from "next-i18next";

import { FacebookIcon, TwitterIcon } from "@/components/Icons/solid";
import { useCopyToClipboard } from "@/hooks";

import { DocumentCheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Typography } from "@msaaqcom/abjad";

interface ShareModalBodyProps {
  productLabel: string;
  productLink: string;
  checkoutLink?: string;
}

const ShareModalBody: FC<ShareModalBodyProps> = ({ productLink, productLabel, checkoutLink }) => {
  const { t } = useTranslation();
  const [copy, values] = useCopyToClipboard();

  return (
    <>
      <Form.Group label={productLabel}>
        <Form.Input
          readOnly
          value={productLink}
          dir="ltr"
          append={
            <Button
              ghost
              variant="default"
              onClick={() => copy(productLink)}
              icon={
                !values.includes(productLink) ? (
                  <Icon
                    size="sm"
                    children={<DocumentDuplicateIcon />}
                  />
                ) : (
                  <Icon
                    size="sm"
                    className="text-success"
                    children={<DocumentCheckIcon />}
                  />
                )
              }
            />
          }
        />
      </Form.Group>
      {checkoutLink && (
        <Form.Group label={t("courses.course_direct_checkout_url")}>
          <Form.Input
            readOnly
            value={checkoutLink}
            dir="ltr"
            append={
              <Button
                ghost
                variant="default"
                onClick={() => copy(checkoutLink)}
                icon={
                  !values.includes(checkoutLink) ? (
                    <Icon
                      size="sm"
                      children={<DocumentDuplicateIcon />}
                    />
                  ) : (
                    <Icon
                      size="sm"
                      className="text-success"
                      children={<DocumentCheckIcon />}
                    />
                  )
                }
              />
            }
          />
        </Form.Group>
      )}
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
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(productLink)}`}
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
            <Trans i18nKey="share_on_facebook">share_via_social_media</Trans>
          </Typography.Paragraph>
          <Typography.Paragraph
            as="a"
            href={`https://twitter.com/intent/tweet?url=${encodeURI(productLink)}`}
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
            <Trans i18nKey="share_on_twitter">share_via_social_media</Trans>
          </Typography.Paragraph>
        </div>
      </div>
    </>
  );
};
export default ShareModalBody;
