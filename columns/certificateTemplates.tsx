import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useConfirmableDelete, useReplicateAction } from "@/hooks";
import {
  useDeleteCertificateTemplateMutation,
  useReplicateCertificateTemplateMutation
} from "@/store/slices/api/certificatesTemplatesSlice";
import { CertificateTemplate } from "@/types";

import { DocumentDuplicateIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface CertificateTemplatesColumnsProps {
  sortables: Array<string>;
  deleteCertificateTemplateHandler: (certificate: CertificateTemplate) => void;
}

const CertificateTemplatesCols = ({
  sortables = [],
  deleteCertificateTemplateHandler
}: CertificateTemplatesColumnsProps) => [
  {
    Header: <Trans i18nKey="certificates_templates.certificate_title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({ row: { original } }: CellProps<CertificateTemplate>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.name}
      />
    )
  },
  {
    Header: <Trans i18nKey="certificates_templates.updated_at">Updated At</Trans>,
    id: "updated_at",
    accessor: "updated_at",
    disableSortBy: !sortables?.includes("updated_at"),
    Cell: ({
      row: {
        original: { updated_at }
      }
    }: CellProps<CertificateTemplate>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={<Time date={updated_at} />}
      />
    )
  },
  {
    Header: <Trans i18nKey="certificates_templates.used_in">used in</Trans>,
    id: "courses_count",
    accessor: "courses_count",
    disableSortBy: !sortables?.includes("courses_count"),
    Cell: ({
      row: {
        original: { courses_count }
      }
    }: CellProps<CertificateTemplate>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={
          <Trans
            i18nKey="certificates_templates.used_in_courses_count"
            values={{ count: courses_count }}
          />
        }
      />
    )
  },

  {
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<CertificateTemplate>) => {
      const { t } = useTranslation();

      const [replicate] = useReplicateAction({
        mutation: useReplicateCertificateTemplateMutation
      });

      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteCertificateTemplateMutation
      });

      return (
        <div className="flex flex-row">
          <Button
            as={Link}
            href={`/students/certificates/${original.id}/edit`}
            variant="default"
            size="sm"
            className="ml-2"
            children={<Trans i18nKey="edit">Edit</Trans>}
          />

          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="default"
                size="sm"
                icon={
                  <Icon
                    size="md"
                    children={<EllipsisHorizontalIcon />}
                  />
                }
              />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item
                as={Link}
                href={`/students/certificates/${original.id}/edit`}
                children={t("certificates_templates.edit")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<PencilSquareIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("duplicate")}
                onClick={() => {
                  replicate(original.id);
                }}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<DocumentDuplicateIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("certificates_templates.delete")}
                className="text-danger"
                iconAlign="end"
                onClick={() => {
                  if (original.courses_count > 0) {
                    deleteCertificateTemplateHandler(original);
                    return;
                  } else {
                    confirmableDelete({
                      id: original.id,
                      title: t("certificates_templates.certificate_removal"),
                      label: t("certificates_templates.confirm_certificate_deletion"),
                      children: t("certificates_templates.delete_certificates_confirm_message", {
                        name: original.name
                      })
                    });
                    return;
                  }
                }}
                icon={
                  <Icon
                    size="sm"
                    children={<TrashIcon />}
                  />
                }
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default CertificateTemplatesCols;
