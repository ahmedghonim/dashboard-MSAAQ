import React, { useContext } from "react";

import Link from "next/link";

import { Trans } from "next-i18next";

import { AuthContext } from "@/contextes";
import dayjs from "@/lib/dayjs";
import { classNames } from "@/utils";

import { ArrowUpLeftIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

import { Button, Collapse, Icon, Typography } from "@msaaqcom/abjad";

const SubscribeButton = () => {
  const { current_academy } = useContext(AuthContext);
  return (
    <div className="pointer-events-none fixed bottom-5 left-0 right-0 flex items-start justify-center sm:left-32 sm:right-auto ">
      <Collapse className={classNames("pointer-events-auto w-72 rounded-lg bg-gray-950 lg:w-80")}>
        {({ isOpen }) => (
          <>
            <Collapse.Button className={classNames("text-white")}>
              <div className={classNames("flex flex-grow flex-row justify-between")}>
                <div className={classNames("flex items-center")}>
                  <Typography.Paragraph
                    size="md"
                    weight="medium"
                  >
                    <Trans
                      i18nKey={
                        isOpen ? "subscribe_now_to_get_features.complete_title" : "subscribe_now_to_get_features.title"
                      }
                    />
                  </Typography.Paragraph>
                </div>
                <Icon
                  className={classNames(
                    isOpen && "rotate-180 transform",
                    "text-white",
                    "transition-all duration-300 ease-in-out"
                  )}
                >
                  <ChevronUpIcon />
                </Icon>
              </div>
            </Collapse.Button>
            <Collapse.Content className={classNames("flex p-4 px-0 text-sm font-extralight text-gray-600")}>
              <div className="px-4">
                <Trans
                  i18nKey="subscribe_now_to_get_features.body"
                  values={{
                    // @ts-ignore
                    days: dayjs(current_academy.trial_ends_at).fromNow(true)
                  }}
                  components={{
                    b: <span className={classNames("font-bold text-white")} />
                  }}
                />
              </div>
              <div className="mt-4 border-t border-gray-900 px-4 pt-4">
                <Button
                  as={Link}
                  variant="gradient"
                  rounded={true}
                  href={"/settings/billing/subscription/plans"}
                  className={classNames("w-full p-4 text-white", isOpen && "border-t border-gray-800")}
                  icon={
                    <Icon
                      size="md"
                      children={<ArrowUpLeftIcon />}
                    />
                  }
                  iconAlign="end"
                >
                  <div className={classNames("flex")}>
                    <Trans i18nKey="subscribe_now_to_get_features.footer" />
                  </div>
                </Button>
              </div>
            </Collapse.Content>
          </>
        )}
      </Collapse>
    </div>
  );
};

export default SubscribeButton;
