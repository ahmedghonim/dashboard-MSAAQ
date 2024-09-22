import { useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Plan } from "@/components/shared/plans/Plan";
import { Plan as PlanModel } from "@/types";

import { Badge, Grid, Typography } from "@msaaqcom/abjad";

export const Plans = ({ plans, title }: { plans: PlanModel[]; title: string }) => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [interval, setInterval] = useState<"monthly" | "yearly" | any>(query?.interval ?? "monthly");

  return (
    <div>
      <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <Typography.Subtitle children={title} />
        <div className="relative flex w-60 gap-3 rounded-full border border-primary p-2">
          <label
            htmlFor="yearly"
            className="absolute -top-12 left-2 z-10 hidden flex-col md:flex"
          >
            <Badge
              variant="orange"
              className="flex rounded-md rounded-bl-none"
              children={
                <Typography.Paragraph
                  children={t("switcher.save_20_percent")}
                  size="md"
                  weight="medium"
                />
              }
            />
            <div
              className="mr-auto cursor-pointer"
              role="button"
            >
              <svg
                width="29"
                height="38"
                viewBox="0 0 29 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_10631_97167)">
                  <path
                    d="M23.9591 5.67803C22.4069 9.73116 18.5606 15.1871 13.9007 15.7422C12.234 15.9497 10.4167 15.6449 9.01525 14.7422C7.41272 13.7963 7.40391 11.897 9.48748 11.8414C10.4263 11.8812 11.2827 12.5574 11.9544 13.2412C13.3986 14.818 14.6818 16.7877 15.2053 18.8904C15.4707 19.9523 15.4764 21.0695 15.3657 22.164C15.1976 23.9459 14.7867 25.7517 14.1892 27.4525C13.2774 29.9497 11.7289 32.1853 9.77291 34.0174C9.31905 34.4526 9.95519 35.165 10.4531 34.7417C14.8704 30.819 17.5967 24.5485 16.4376 18.6448C16.2152 17.4463 15.7927 16.2491 15.1738 15.192C14.2508 13.6258 13.1778 12.0025 11.5736 10.9587C9.6327 9.59181 6.43987 10.2838 6.1922 12.8997C6.09117 14.4393 7.21283 15.6967 8.49577 16.4004C11.358 17.9442 15.0127 17.8777 17.7027 16.0877C19.2484 15.1131 20.5654 13.7576 21.6381 12.3196C23.0848 10.4082 24.1344 8.28661 25.1089 6.14913C25.2498 5.83969 25.1088 5.4759 24.7964 5.33503C24.471 5.18645 24.0827 5.34492 23.9581 5.67355L23.9591 5.67803Z"
                    fill="#ED702D"
                  />
                  <path
                    d="M24.7451 5.12752C24.4084 5.0373 24.0391 5.16487 23.8405 5.46519C23.0174 6.70115 21.9843 7.73477 20.7702 8.53783C20.1381 8.95698 19.457 9.31009 18.7437 9.59106C18.3186 9.75871 18.1161 10.2337 18.287 10.6542C18.4599 11.0753 18.9424 11.2786 19.3671 11.113C20.188 10.791 20.9724 10.3809 21.7009 9.89865C21.9881 9.70885 22.2653 9.50792 22.5322 9.29785C22.4231 10.0096 22.3736 10.7796 22.4164 11.5977C22.4871 12.9694 22.8075 14.3149 23.3642 15.5966C23.5447 16.0134 24.0339 16.2079 24.4546 16.0328C24.8753 15.8576 25.0688 15.3759 24.8883 14.9592C24.4077 13.8587 24.135 12.7039 24.0743 11.5275C23.9567 9.26462 24.6584 7.43936 25.2689 6.30733C25.4752 5.92227 25.3393 5.44339 24.9571 5.2182C24.8903 5.17912 24.8188 5.14937 24.7466 5.13004L24.7451 5.12752Z"
                    fill="#ED702D"
                  />
                  <path
                    d="M25.9467 14.8146C24.639 12.1672 24.7634 8.95301 26.3044 6.44867C26.4217 6.25146 26.1296 6.05888 25.9923 6.25072C24.2124 8.75667 24.0048 12.3212 25.6317 14.98C25.7469 15.1675 26.0406 15.0175 25.9462 14.8165L25.9467 14.8146Z"
                    fill="#ED702D"
                  />
                  <path
                    d="M17.3462 20.4318C17.3262 20.4264 17.3031 20.4245 17.2794 20.4245C17.1662 20.4302 17.0779 20.5272 17.0859 20.6415L17.1951 22.3347C17.2016 22.4466 17.3005 22.5345 17.4163 22.5274C17.5295 22.5217 17.6178 22.4247 17.6097 22.3104L17.5006 20.6171C17.4948 20.5267 17.4304 20.4544 17.3462 20.4318Z"
                    fill="#ED702D"
                  />
                  <path
                    d="M17.3775 19.8807C17.3629 19.1253 17.2955 18.3747 17.217 17.6254C17.2023 17.4479 17.3114 17.3374 17.4659 17.2497C18.195 16.7655 18.9198 16.2653 19.6202 15.7438C19.7461 15.6505 19.6131 15.4497 19.4752 15.5313C18.7668 15.9385 18.0665 16.3711 17.3807 16.814L17.2326 16.9098C17.0487 17.0109 16.8612 17.1977 16.8135 17.4157C16.7735 17.5489 16.7935 17.7067 16.8124 17.8367C16.8972 18.5305 17.0001 19.2207 17.1423 19.9087C17.1701 20.0453 17.3801 20.0232 17.3764 19.8847L17.3775 19.8807Z"
                    fill="#ED702D"
                  />
                  <path
                    d="M9.6734 33.2514C12.1845 30.3656 13.8666 26.7897 14.4816 23.0274C14.5102 22.8403 14.2189 22.7813 14.1821 22.9747C13.5268 26.6627 11.8288 30.1538 9.32789 32.9535C9.13282 33.1764 9.47125 33.4767 9.6734 33.2514Z"
                    fill="#ED702D"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_10631_97167">
                    <rect
                      width="19.6622"
                      height="32.532"
                      fill="white"
                      transform="matrix(0.965926 0.258819 0.258819 -0.965926 0.917969 32.4219)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </label>

          <div className="w-full">
            <input
              type="radio"
              name="interval"
              id="monthly"
              value="monthly"
              className="peer hidden"
              defaultChecked={interval == "monthly"}
              onChange={(e) => setInterval(e.target.value)}
            />
            <label
              htmlFor="monthly"
              className="block cursor-pointer select-none rounded-full px-8 py-1 text-center text-primary peer-checked:bg-primary peer-checked:text-white"
            >
              <Typography.Paragraph
                size="lg"
                weight="medium"
                children={t("switcher.monthly")}
              />
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="radio"
              name="interval"
              id="yearly"
              value="yearly"
              className="peer hidden"
              defaultChecked={interval == "yearly"}
              onChange={(e) => setInterval(e.target.value)}
            />
            <label
              htmlFor="yearly"
              className="block cursor-pointer select-none rounded-full px-8 py-1 text-center text-primary peer-checked:bg-primary peer-checked:text-white"
            >
              <Typography.Paragraph
                size="lg"
                weight="medium"
                children={t("switcher.yearly")}
              />
            </label>
          </div>
        </div>
      </div>
      <Grid
        columns={{
          lg: 3,
          sm: 1
        }}
      >
        {plans?.map((plan, i) => (
          <Grid.Cell key={i}>
            <Plan
              interval={interval}
              plan={plan}
            />
          </Grid.Cell>
        ))}
      </Grid>
    </div>
  );
};
