import { useContext, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import CreateNewAcademyModal from "@/components/modals/CreateNewAcademyModal";
import SearchModal from "@/components/modals/SearchModal";
import NotificationsDropdown from "@/components/notificationsDropdown";
import Search from "@/components/select/Search";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { AuthContext } from "@/contextes";
import { isCustomizedDomain, useAppSelector } from "@/hooks";
import { AppSliceStateType } from "@/store/slices/app-slice";

import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Button, Header, Icon, Typography } from "@msaaqcom/abjad";

import AcademySwitcher from "../shared/AcademySwitcher";

const AppHeader = ({ title: providedTitle }: { title?: string }) => {
  const { t } = useTranslation();
  const { current_academy } = useContext(AuthContext);
  const { headerTitle, backLink } = useAppSelector<AppSliceStateType>((state) => state.app);
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  return (
    <div className="border-b border-gray-400 print:hidden">
      <Header className="container flex">
        <div className="flex flex-shrink-0 items-center justify-start">
          {backLink && (
            <Button
              className="ltr:mr-4 rtl:ml-4"
              variant="default"
              size="sm"
              onClick={async () => {
                if (backLink) {
                  await router.push(backLink);
                } else {
                  router.back();
                }
              }}
              icon={
                <Icon size="sm">
                  <ChevronLeftIcon className="ltr:block rtl:hidden" />
                  <ChevronRightIcon className="ltr:hidden rtl:block" />
                </Icon>
              }
            />
          )}
          <Typography.Paragraph
            size="lg"
            weight="medium"
            children={headerTitle ?? providedTitle}
          />
        </div>

        <div className="hidden w-full justify-center md:flex">
          <Search />
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-4 xs:gap-3 ">
          <Button
            size="md"
            variant={"default"}
            as={Link}
            href={`https://${current_academy.domain}`}
            target="_blank"
            className=" academy-view hidden flex-shrink-0 items-center !justify-start lg:flex"
            icon={
              <Icon
                size="md"
                children={<EyeIcon />}
              />
            }
          >
            {t("user_dropdown.preview")}
          </Button>

          <div className="xs:hidden md:block">
            <LanguageSwitcher />
          </div>
          <Button
            variant={"default"}
            className="xs:flex md:hidden"
            outline
            onClick={() => {
              setShowSearchModal(true);
            }}
            icon={
              <Icon className="relative">
                <MagnifyingGlassIcon />
              </Icon>
            }
          />
          <NotificationsDropdown />

          <div className="xs:hidden md:block">
            <AcademySwitcher />
          </div>
        </div>
      </Header>
      <CreateNewAcademyModal
        open={show}
        onDismiss={() => {
          setShow(false);
        }}
      />
      <SearchModal
        open={showSearchModal}
        onDismiss={() => {
          setShowSearchModal(false);
        }}
      />
    </div>
  );
};
export default AppHeader;
