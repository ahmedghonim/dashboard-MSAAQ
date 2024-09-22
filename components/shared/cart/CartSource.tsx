import React from "react";

import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { SessionSource } from "@/types";

import { CogIcon, ComputerDesktopIcon, GlobeAltIcon, LinkIcon } from "@heroicons/react/24/outline";

import { Icon, Title } from "@msaaqcom/abjad";

type Props = {
  source: SessionSource;
};

export const CartSource = ({ source }: Props) => {
  const { t } = useTranslation();

  return (
    <Card label={t("orders.order_source.title")}>
      <Card.Body className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Icon children={<GlobeAltIcon />} />
            <Title
              reverse
              title={
                <span
                  children={isEmpty(source?.browser_name) ? "-" : source?.browser_name}
                  title={`${source?.browser_name} ${source?.browser_version}`}
                />
              }
              subtitle={t("orders.order_source.browser_name")}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Icon children={<CogIcon />} />
            <Title
              reverse
              title={
                <span
                  children={source?.os_name ?? source?.device_family ?? "-"}
                  title={`${source?.os_name} ${source?.os_version}`}
                />
              }
              subtitle={t("orders.order_source.device_family")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Icon children={<LinkIcon />} />
            <Title
              className="truncate"
              reverse
              title={
                <span
                  children={isEmpty(source?.referer) ? "-" : source?.referer}
                  title={isEmpty(source?.referer) ? "-" : source?.referer}
                  onClick={(event) => {
                    window.getSelection()?.selectAllChildren(event.currentTarget);
                  }}
                />
              }
              subtitle={t("orders.order_source.referer")}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Icon children={<ComputerDesktopIcon />} />

            <Title
              reverse
              title={isEmpty(source?.device_type) ? "-" : source?.device_type}
              subtitle={t("orders.order_source.device_type")}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
