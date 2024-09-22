import { useRouter } from "next/router";

import { setCookie } from "cookies-next";
import { i18n, useTranslation } from "next-i18next";

import { setAcceptLanguage } from "@/lib/axios";
import dayjs from "@/lib/dayjs";

import { Button, Icon, Tooltip } from "@msaaqcom/abjad";

const LanguageIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_21628_39844)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 3.02153C6.1459 3.02153 3.02153 6.1459 3.02153 10C3.02153 13.8541 6.1459 16.9785 10 16.9785C13.8541 16.9785 16.9785 13.8541 16.9785 10C16.9785 6.1459 13.8541 3.02153 10 3.02153ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.56764 4.87783C8.103 6.16423 7.80571 7.97513 7.80571 10C7.80571 12.0249 8.103 13.8358 8.56764 15.1222C8.80074 15.7675 9.06629 16.2537 9.33552 16.569C9.60638 16.8862 9.83284 16.9785 10.0001 16.9785C10.1673 16.9785 10.3937 16.8862 10.6646 16.569C10.9338 16.2537 11.1994 15.7675 11.4325 15.1222C11.8971 13.8358 12.1944 12.0249 12.1944 10C12.1944 7.97513 11.8971 6.16423 11.4325 4.87783C11.1994 4.23248 10.9338 3.74626 10.6646 3.431C10.3937 3.11382 10.1673 3.02153 10.0001 3.02153C9.83284 3.02153 9.60638 3.11382 9.33552 3.431C9.06629 3.74626 8.80074 4.23248 8.56764 4.87783ZM8.5587 2.76762C8.93511 2.32684 9.42029 2 10.0001 2C10.5798 2 11.065 2.32684 11.4414 2.76762C11.8195 3.21031 12.1368 3.82086 12.3933 4.5308C12.9077 5.95496 13.2159 7.88868 13.2159 10C13.2159 12.1113 12.9077 14.045 12.3933 15.4692C12.1368 16.1791 11.8195 16.7897 11.4414 17.2324C11.065 17.6732 10.5798 18 10.0001 18C9.42029 18 8.93511 17.6732 8.5587 17.2324C8.18065 16.7897 7.86329 16.1791 7.60687 15.4692C7.09246 14.045 6.78418 12.1113 6.78418 10C6.78418 7.88868 7.09246 5.95496 7.60687 4.5308C7.86329 3.82086 8.18065 3.21031 8.5587 2.76762Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.47632 7.60061C2.47632 7.31852 2.705 7.08984 2.98708 7.08984H16.9785C17.2606 7.08984 17.4892 7.31852 17.4892 7.60061C17.4892 7.8827 17.2606 8.11138 16.9785 8.11138H2.98708C2.705 8.11138 2.47632 7.8827 2.47632 7.60061ZM2.47632 12.3997C2.47632 12.1176 2.705 11.8889 2.98708 11.8889H16.9785C17.2606 11.8889 17.4892 12.1176 17.4892 12.3997C17.4892 12.6818 17.2606 12.9105 16.9785 12.9105H2.98708C2.705 12.9105 2.47632 12.6818 2.47632 12.3997Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_21628_39844">
          <rect
            width="20"
            height="20"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const LanguageSwitcher = ({
  isGhost = false,
  shortKey = false,
  isSmallScreen = false
}: {
  isGhost?: boolean;
  shortKey?: boolean;
  isSmallScreen?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          {...(!isSmallScreen
            ? { variant: "default", ghost: isGhost }
            : { className: "bg-white/15 focus:bg-white/20" })}
          dir={`${i18n?.language == "ar" ? "ltr" : "rtl"}`}
          onClick={() => {
            i18n?.changeLanguage(i18n?.language == "ar" ? "en" : "ar");
            router.push(router.asPath, router.asPath, { locale: i18n?.language });
            setCookie("current_locale", i18n?.language == "en" ? "en-US" : "ar");
            dayjs.locale(i18n?.language == "en" ? "en" : "ar");

            setAcceptLanguage(i18n?.language == "en" ? "en-US" : "ar");
          }}
          children={
            <div className={`flex gap-3 ${!isSmallScreen && "px-1"}`}>
              <Icon>
                <div>
                  <div
                    style={{
                      backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${
                        i18n?.language == "ar" ? "us" : "sa"
                      }.svg)`
                    }}
                    className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                  />
                </div>
              </Icon>
              <span>
                {shortKey ? (i18n?.language == "en" ? "AR" : "EN") : i18n?.language == "ar" ? "English" : "عربي"}
              </span>
            </div>
          }
        />
      </Tooltip.Trigger>
      <Tooltip.Content children={t("click_to_change_language")} />
    </Tooltip>
  );
};

export default LanguageSwitcher;
