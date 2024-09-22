import Link from "next/link";
import { useRouter } from "next/router";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { useConfirmableDelete, useDataExport, useReplicateAction } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { useDeleteCampaignMutation, useReplicateCampaignMutation } from "@/store/slices/api/campaignsSlice";
import { Campaign, CampaignStatus } from "@/types";
import { classNames, getStatusColor } from "@/utils";

import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

import { Badge, Button, Dropdown, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

interface CampaignColumnsProps {
  sortables: Array<string>;
  filter: string;
}

const CampaignCols = ({ sortables = [], filter }: CampaignColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="marketing.campaigns.name">name</Trans>,
      id: "name",
      accessor: "name",
      disableSortBy: true,
      width: 250,
      Cell: ({ row: { original } }: CellProps<Campaign>) => {
        return (
          <Link
            href={
              original.status == "published"
                ? `/marketing/campaigns/${original.id}`
                : `/marketing/campaigns/${original.id}/edit`
            }
          >
            <Typography.Paragraph
              as="span"
              size="md"
              weight="medium"
              children={original.name}
            />
          </Link>
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.sent_at">sent at</Trans>,
      id: "sent_at",
      accessor: "sent_at",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Campaign>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={
              original.status == "draft" ? (
                <Trans i18nKey={"marketing.campaigns.not_sent_yet"} />
              ) : original.status == "scheduled" ? (
                <Trans
                  i18nKey={"marketing.campaigns.scheduled_at"}
                  values={{
                    date: dayjs(original.scheduled_at).format("DD/MM/YYYY")
                  }}
                />
              ) : original.status == "published" ? (
                original.sent_at ? (
                  dayjs(original.sent_at).format("DD/MM/YYYY")
                ) : (
                  "-"
                )
              ) : (
                "-"
              )
            }
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.recipient_count">recipient_count</Trans>,
      id: "recipient_count",
      accessor: "recipient_count",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Campaign>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.recipient_count ? original.recipient_count : "-"}
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.open_rate">open_rate</Trans>,
      id: "open_rate",
      accessor: "open_rate",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Campaign>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.open_rate ? `${original.open_rate / 100}%` : "-"}
          />
        );
      }
    },
    ...(filter == "unpublished"
      ? [
          {
            Header: <Trans i18nKey="marketing.campaigns.status">status</Trans>,
            id: "status",
            accessor: "status",
            disableSortBy: true,
            Cell: ({ row: { original } }: CellProps<Campaign>) => {
              return (
                <Badge
                  size="xs"
                  variant={getStatusColor(original.status)}
                  soft
                  children={
                    <Trans
                      i18nKey={`marketing.campaigns.statuses.${original.status}`}
                      children={original.status}
                    />
                  }
                />
              );
            }
          }
        ]
      : []),
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Campaign>) => {
        const { t } = useTranslation();

        const [confirmableDelete] = useConfirmableDelete({
          mutation: useDeleteCampaignMutation
        });

        const [replicate] = useReplicateAction({
          mutation: useReplicateCampaignMutation
        });

        const [exportCampaign] = useDataExport();
        const handleExport = async () => {
          exportCampaign({
            endpoint: `/campaigns/${original.id}/export`,
            name: "campaigns",
            ids: [original.id]
          });
        };

        const router = useRouter();
        return (
          <div className="flex flex-row">
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  onClick={() => {
                    router.replace(`/marketing/campaigns/${original.id}/edit`);
                  }}
                  variant="default"
                  disabled={original.status == CampaignStatus.PUBLISHED}
                  size="sm"
                  className="ml-2"
                  children={<Trans i18nKey="edit">Edit</Trans>}
                />
              </Tooltip.Trigger>
              {original.status == CampaignStatus.PUBLISHED && (
                <Tooltip.Content>{t("marketing.campaigns.edit_button_tooltip")}</Tooltip.Content>
              )}
            </Tooltip>
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
                {original.status == CampaignStatus.PUBLISHED && (
                  <Dropdown.Item
                    onClick={() => {
                      if (original.status !== CampaignStatus.PUBLISHED) {
                        return;
                      }
                      handleExport();
                    }}
                    children={t("export")}
                    className={classNames(original.status !== CampaignStatus.PUBLISHED && "!cursor-not-allowed")}
                    disabled={original.status !== CampaignStatus.PUBLISHED}
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<ArrowDownTrayIcon />}
                      />
                    }
                  />
                )}
                {original.status !== CampaignStatus.PUBLISHED && (
                  <>
                    <Dropdown.Item
                      children={t("duplicate")}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<DocumentDuplicateIcon />}
                        />
                      }
                      onClick={() => replicate(original.id)}
                    />
                    <Dropdown.Divider />
                    <Dropdown.Item
                      children={t("marketing.campaigns.delete_button")}
                      className="text-danger"
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<TrashIcon />}
                        />
                      }
                      onClick={() => {
                        confirmableDelete({
                          id: original.id,
                          title: t("marketing.campaigns.delete_campaign_title"),
                          label: t("marketing.campaigns.delete_campaign_label"),
                          children: t("marketing.campaigns.delete_campaign_confirm_message")
                        });
                      }}
                    />
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        );
      }
    }
  ];
};

export default CampaignCols;
