import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { OnboardingCard, Sidebar } from "@/components";
import { useFetchOnboardingListQuery } from "@/store/slices/api/onboardingSlice";
import { OnboardingData, Step } from "@/types/models/onboarding";
import { classNames } from "@/utils";

import { CheckBadgeIcon, MapIcon } from "@heroicons/react/24/outline";

import { Icon, Typography } from "@msaaqcom/abjad";

const Onboarding = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const { data: onboardingList = {} as OnboardingData[] } = useFetchOnboardingListQuery();

  useEffect(() => {
    if (onboardingList.length > 0) {
      let isAllRead = onboardingList.every((item: OnboardingData) => {
        return item.steps.every((step: Step) => step.is_read);
      });
      setIsFinished(isAllRead);
    }
  });

  const handleChange = (value: boolean) => {
    setOpen(value);
  };

  if (!onboardingList.length) return null;

  return (
    <>
      <Sidebar.Button
        className={classNames("mb-2", isFinished ? "bg-success" : "bg-secondary")}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Typography.Paragraph
          size="md"
          weight="bold"
          className="text-white"
          children={t("onboarding.onboarding_nav")}
        />
        <Icon
          size="md"
          className="mr-auto text-white"
          children={isFinished ? <CheckBadgeIcon /> : <MapIcon />}
        />
      </Sidebar.Button>
      <OnboardingCard
        open={open}
        onboardingList={onboardingList}
        onChange={handleChange}
        isFinished={isFinished}
      />
    </>
  );
};
export default Onboarding;
