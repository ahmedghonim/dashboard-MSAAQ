import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import TabContent from "@/components/tabs/TabContent";
import TabLink from "@/components/tabs/TabLink";
import TabsGroup from "@/components/tabs/TabsGroup";
import { classNames } from "@/utils";

import { EyeIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Menu } from "@msaaqcom/abjad";

export interface TabsProps {
  children: React.ReactNode | any;
  className?: string;
  center?: boolean;
  preview_url?: string;
}

const Tabs: FC<TabsProps> = ({ children, className, preview_url, center, ...props }: TabsProps) => {
  const { t } = useTranslation();
  return (
    <Menu
      align="horizontal"
      className={classNames(
        "h-[54px] overflow-y-hidden overflow-x-scroll whitespace-nowrap border-b border-gray-400 bg-white",
        className
      )}
      {...props}
    >
      {children?.type === React.Fragment ? (
        children
      ) : (
        <div
          className={classNames("container relative h-full", center && "flex justify-center")}
          children={
            <div className={"flex items-center justify-between"}>
              <div className="h-[53px]">{children}</div>
              {preview_url && (
                <Button
                  as={Link}
                  className="text-gray-800 hover:text-gray-800 hover:no-underline"
                  href={preview_url}
                  variant="link"
                  icon={
                    <Icon>
                      <EyeIcon />
                    </Icon>
                  }
                  target="_blank"
                  children={t("preview")}
                />
              )}
            </div>
          }
        />
      )}
    </Menu>
  );
};

type Tabs<P = {}> = FC<P> & {
  Link: typeof TabLink;
  Group: typeof TabsGroup;
  Content: typeof TabContent;
};

export default Tabs as Tabs<TabsProps>;
