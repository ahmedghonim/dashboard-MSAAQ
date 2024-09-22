import { ReactNode, useContext, useState } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { AuthContext } from "@/contextes";
import { useResponseToastHandler } from "@/hooks";
import { useGrant100MessageMutation } from "@/store/slices/api/campaignsSlice";
import { APIActionResponse } from "@/types";
import { classNames } from "@/utils";

import { Button, Icon } from "@msaaqcom/abjad";

const PlanBanner = () => {
  const { t } = useTranslation();
  const { current_academy, refetchAuth } = useContext(AuthContext);
  const [grantFreeMessages] = useGrant100MessageMutation();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const items: {
    title: string;
    subtitle: string;
    icon: ReactNode;
  }[] = [
    {
      title: t("email_bundles.plan_1_title"),
      subtitle: t("email_bundles.plan_1_subtitle"),
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 19.9902C12.0328 20.0094 10.5713 20.0004 9.09883 19.9634C5.95033 19.8843 4.37608 19.8448 3.24496 18.7094C2.11383 17.5739 2.08114 16.0412 2.01577 12.9756C1.99475 11.9899 1.99474 11.0101 2.01576 10.0244C2.08114 6.95885 2.11382 5.42608 3.24495 4.29065C4.37608 3.15521 5.95033 3.11566 9.09882 3.03656C11.0393 2.98781 12.9607 2.98781 14.9012 3.03657C18.0497 3.11568 19.6239 3.15523 20.7551 4.29066C21.8862 5.42609 21.9189 6.95886 21.9842 10.0244C21.9947 10.5172 22 11.0086 22 11.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 5.5L8.91302 9.42462C11.4387 10.8585 12.5613 10.8585 15.087 9.42462L22 5.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            opacity="0.4"
            d="M16 16.5C16.4915 15.9943 17.7998 14 18.5 14M21 16.5C20.5085 15.9943 19.2002 14 18.5 14M18.5 14V22"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      title: t("email_bundles.plan_2_title"),
      subtitle: t("email_bundles.plan_2_subtitle"),
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="8.5"
            cy="11"
            r="1.5"
            stroke="black"
            strokeWidth="1.5"
          />
          <circle
            cx="14.5"
            cy="16"
            r="1.5"
            stroke="black"
            strokeWidth="1.5"
          />
          <circle
            cx="18.5"
            cy="8"
            r="1.5"
            stroke="black"
            strokeWidth="1.5"
          />
          <path
            opacity="0.4"
            d="M15.4341 14.7963L18 9.5M9.58251 12.0684L13.2038 14.7963M3 19.5L7.58957 12.3792"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 21.5H9C5.70017 21.5 4.05025 21.5 3.02513 20.4749C2 19.4497 2 17.7998 2 14.5V3.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    },
    {
      title: t("email_bundles.plan_3_title"),
      subtitle: t("email_bundles.plan_3_subtitle"),
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.4"
            d="M20.774 18.5C21.5233 18.5 22.1193 18.0285 22.6545 17.3691C23.7499 16.0194 21.9513 14.9408 21.2654 14.4126C20.568 13.8756 19.7894 13.5714 19 13.5M18 11.5C19.3807 11.5 20.5 10.3807 20.5 9C20.5 7.61929 19.3807 6.5 18 6.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            opacity="0.4"
            d="M3.22596 18.5C2.47666 18.5 1.88067 18.0285 1.34555 17.3691C0.250089 16.0194 2.04867 14.9408 2.73465 14.4126C3.43197 13.8756 4.21058 13.5714 5 13.5M5.5 11.5C4.11929 11.5 3 10.3807 3 9C3 7.61929 4.11929 6.5 5.5 6.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8.0838 15.6112C7.06203 16.243 4.38299 17.5331 6.0147 19.1474C6.81178 19.936 7.69952 20.5 8.81563 20.5H15.1844C16.3005 20.5 17.1882 19.936 17.9853 19.1474C19.617 17.5331 16.938 16.243 15.9162 15.6112C13.5201 14.1296 10.4799 14.1296 8.0838 15.6112Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 8C15.5 9.933 13.933 11.5 12 11.5C10.067 11.5 8.5 9.933 8.5 8C8.5 6.067 10.067 4.5 12 4.5C13.933 4.5 15.5 6.067 15.5 8Z"
            stroke="black"
            strokeWidth="1.5"
          />
        </svg>
      )
    },
    {
      title: t("email_bundles.plan_4_title"),
      subtitle: t("email_bundles.plan_4_subtitle"),
      icon: (
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 18.5C18.4183 18.5 22 14.9183 22 10.5C22 6.08172 18.4183 2.5 14 2.5C9.58172 2.5 6 6.08172 6 10.5C6 14.9183 9.58172 18.5 14 18.5Z"
            stroke="#141B34"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            opacity="0.4"
            d="M3.15657 11.5C2.42523 12.6176 2 13.9535 2 15.3888C2 19.3162 5.18378 22.5 9.11116 22.5C10.5465 22.5 11.8824 22.0748 13 21.3434"
            stroke="#141B34"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            opacity="0.4"
            d="M14.7349 6.5C14.7349 6.08579 14.3991 5.75 13.9849 5.75C13.5707 5.75 13.2349 6.08579 13.2349 6.5L14.7349 6.5ZM13.2349 14.5C13.2349 14.9142 13.5707 15.25 13.9849 15.25C14.3991 15.25 14.7349 14.9142 14.7349 14.5H13.2349ZM15.069 8.86959C15.1504 9.27573 15.5456 9.53899 15.9517 9.4576C16.3579 9.37621 16.6211 8.98099 16.5397 8.57486L15.069 8.86959ZM12.7327 12.1178C12.6444 11.7131 12.2447 11.4567 11.84 11.545C11.4353 11.6334 11.1789 12.0331 11.2673 12.4378L12.7327 12.1178ZM13.9849 9.63495C13.3788 9.63495 13.1228 9.51911 13.0251 9.44128C12.9661 9.39417 12.8878 9.30275 12.8878 9.00223H11.3878C11.3878 9.59264 11.5613 10.1926 12.09 10.6141C12.5801 11.0049 13.2477 11.1349 13.9849 11.1349V9.63495ZM12.8878 9.00223C12.8878 8.61771 13.2803 8.13906 13.9849 8.13906V6.63906C12.6492 6.63906 11.3878 7.6049 11.3878 9.00223H12.8878ZM15.25 11.9981C15.25 12.3489 15.1282 12.5168 14.9752 12.6255C14.7842 12.7613 14.4549 12.8613 13.9849 12.8613V14.3613C14.6278 14.3613 15.306 14.2308 15.8444 13.8481C16.4207 13.4383 16.75 12.7996 16.75 11.9981H15.25ZM13.9849 11.1349C14.5987 11.1349 14.8988 11.2457 15.0379 11.3531C15.1337 11.4271 15.25 11.5729 15.25 11.9981H16.75C16.75 11.271 16.5304 10.6103 15.9545 10.1657C15.422 9.75464 14.7146 9.63495 13.9849 9.63495V11.1349ZM14.7349 7.38906L14.7349 6.5L13.2349 6.5L13.2349 7.38906L14.7349 7.38906ZM13.2349 13.6113V14.5H14.7349V13.6113H13.2349ZM13.9849 8.13906C14.6033 8.13906 14.9994 8.5226 15.069 8.86959L16.5397 8.57486C16.3057 7.40692 15.1881 6.63906 13.9849 6.63906V8.13906ZM13.9849 12.8613C13.2343 12.8613 12.8019 12.4344 12.7327 12.1178L11.2673 12.4378C11.529 13.6364 12.748 14.3613 13.9849 14.3613V12.8613Z"
            fill="#141B34"
          />
        </svg>
      )
    }
  ];
  return (
    <div
      className={classNames(
        "my-10 rounded-2xl border  p-6",
        current_academy.on_trial ? "card-alert-gradient" : "border-purple bg-purple-50"
      )}
    >
      <div
        className={classNames(
          "mb-1 text-center font-semibold",
          current_academy.on_trial ? "text-success" : "text-purple"
        )}
      >
        {current_academy.on_trial ? t("email_bundles.plan_banner.title_trial") : t("email_bundles.plan_banner.title")}
      </div>
      <div className="mx-auto mb-1 max-w-[800px] text-center text-2xl font-bold">
        {current_academy.on_trial
          ? t("email_bundles.plan_banner.subtitle_trial")
          : t("email_bundles.plan_banner.subtitle")}
      </div>
      <div className="text-center text-gray-900">
        {current_academy.on_trial
          ? t("email_bundles.plan_banner.paragraph_trial")
          : t("email_bundles.plan_banner.paragraph")}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-2xl bg-white px-4 py-6"
          >
            <Icon
              className="!h-6 !w-6 flex-shrink-0"
              children={item.icon}
            />
            <div className="flex flex-col gap-2">
              <div className="font-semibold">{item.title}</div>
              <div className="text-gray-800">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-6">
        <Button
          variant={current_academy.on_trial ? "gradient" : undefined}
          className={classNames(
            current_academy.on_trial ? "" : "border-purple bg-transparent text-purple hover:bg-purple hover:text-white"
          )}
          rounded
          as={Link}
          href={current_academy.on_trial ? "/settings/billing/subscription/plans" : "/settings/billing/email-bundles"}
          icon={
            current_academy.on_trial ? (
              <Icon
                children={
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.16602 8.83398C2.16602 6.47696 2.16602 5.29845 2.89825 4.56622C3.63048 3.83398 4.80899 3.83398 7.16602 3.83398H13.8327C16.1897 3.83398 17.3682 3.83398 18.1005 4.56622C18.8327 5.29845 18.8327 6.47696 18.8327 8.83398V12.1673C18.8327 14.5243 18.8327 15.7029 18.1005 16.4351C17.3682 17.1673 16.1897 17.1673 13.8327 17.1673H7.16602C4.80899 17.1673 3.63048 17.1673 2.89825 16.4351C2.16602 15.7029 2.16602 14.5243 2.16602 12.1673V8.83398Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 8.75488C5.5 4.96787 10.5 8.82643 10.5 11.3346H7.58333C6.136 11.3346 5.5 10.0595 5.5 8.75488Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.5 8.75488C15.5 4.96787 10.5 8.82643 10.5 11.3346H13.4167C14.864 11.3346 15.5 10.0595 15.5 8.75488Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.5 3.83398V17.1673"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.16602 11.334H18.8327"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 13.834L10.5 11.334L8 13.834"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ) : undefined
          }
        >
          {current_academy.on_trial
            ? t("email_bundles.plan_banner.discover_trial")
            : t("email_bundles.plan_banner.discover")}
        </Button>

        {!current_academy.on_trial && (
          <Button
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              const res = (await grantFreeMessages()) as APIActionResponse<any>;
              if (displayErrors(res)) {
                setIsSubmitting(false);
                return;
              }
              displaySuccess(res);
              setTimeout(async () => {
                await refetchAuth();
                setIsSubmitting(false);
              }, 2500);
            }}
            icon={
              <Icon
                children={
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66602 8.83398C1.66602 6.47696 1.66602 5.29845 2.39825 4.56622C3.13048 3.83398 4.30899 3.83398 6.66602 3.83398H13.3327C15.6897 3.83398 16.8682 3.83398 17.6005 4.56622C18.3327 5.29845 18.3327 6.47696 18.3327 8.83398V12.1673C18.3327 14.5243 18.3327 15.7029 17.6005 16.4351C16.8682 17.1673 15.6897 17.1673 13.3327 17.1673H6.66602C4.30899 17.1673 3.13048 17.1673 2.39825 16.4351C1.66602 15.7029 1.66602 14.5243 1.66602 12.1673V8.83398Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 8.75488C5 4.96787 10 8.82643 10 11.3346H7.08333C5.636 11.3346 5 10.0595 5 8.75488Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 8.75488C15 4.96787 10 8.82643 10 11.3346H12.9167C14.364 11.3346 15 10.0595 15 8.75488Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 3.83398V17.1673"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.66602 11.334H18.3327"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.5 13.834L10 11.334L7.5 13.834"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            }
            variant={"gradient"}
            rounded
          >
            {t("email_bundles.plan_banner.grant_free_messages")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanBanner;
