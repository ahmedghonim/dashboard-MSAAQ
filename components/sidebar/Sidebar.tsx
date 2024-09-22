import React, { FC, HTMLProps, useContext, useMemo, useState } from "react";



import { useTranslation } from "next-i18next";



import SidebarBrand from "@/components/sidebar/SidebarBrand";
import SidebarButton from "@/components/sidebar/SidebarButton";
import SidebarItem from "@/components/sidebar/SidebarItem";
import SidebarLink from "@/components/sidebar/SidebarLink";
import { AuthContext } from "@/contextes";
import { isCustomizedDomain } from "@/hooks";
import { classNames } from "@/utils";



import "@heroicons/react/16/solid";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";
import { Menu01Icon } from "@msaaqcom/hugeicons/sharp/solid";



import CreateNewProductModal from "../modals/CreateNewProductModal";
import AcademySwitcher from "../shared/AcademySwitcher";
import LanguageSwitcher from "../shared/LanguageSwitcher";


export interface SidebarProps extends HTMLProps<HTMLLinkElement> {
  children: React.ReactNode;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  brand?: React.ReactElement<typeof SidebarBrand>;
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ children, brand, prepend, append }: SidebarProps) => {
  const { current_academy } = useContext(AuthContext);
  const sideNavClasses = useMemo(() => {
    if (current_academy.is_plus && !isCustomizedDomain()) {
      return "bg-black";
    } else {
      return "bg-primary-700";
    }
  }, [current_academy]);
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <div className=" relative z-40 md:fixed md:inset-y-0 md:flex md:w-52 md:flex-col">
        <div className={classNames("flex flex-grow flex-col overflow-y-auto pt-6 print:hidden", sideNavClasses)}>
          <div className="xs:hidden md:block"> {brand && brand}</div>

          <div className="px-4 xs:relative md:hidden ">
            <div className="flex justify-between pb-4">
              <div className="flex gap-1">
                <button
                  onClick={toggleMenu}
                  className="h-auto w-6 hover:text-gray-700 focus:outline-none"
                >
                  {isOpen ? <XMarkIcon className="text-white" /> : <Menu01Icon className="text-white" />}
                </button>
                {brand && brand}
              </div>
              <div className="flex max-h-10 gap-4 text-white opacity-85">
                <LanguageSwitcher
                  isGhost={true}
                  isSmallScreen={true}
                />
                <AcademySwitcher hasChevronDownIcon={false} />
              </div>
            </div>
            {isOpen && (
              <div>
                <nav
                  className="sticky top-0 flex flex-1 flex-col gap-1 pb-4 pt-2"
                  children={children}
                />
                <div className=""> {append && append}</div>
              </div>
            )}
          </div>
          <div className="mt-6 flex-1 flex-col  px-2 xs:hidden md:flex">
            {prepend && prepend}

            <div>
              <nav
                className="flex-1 flex-col gap-1 pb-4 xs:hidden md:flex"
                children={children}
              />
            </div>

            {append && append}
          </div>
        </div>
      </div>
      {!isOpen && (
        <div className="fixed bottom-7 z-10 sm:hidden ltr:right-4 rtl:right-4">
          <Button
            onClick={() => {
              setShow(true);
            }}
            className="px-2.5 py-6"
          >
            <div className="flex gap-2">
              <Icon
                size="md"
                className="mr-auto"
                children={<PlusCircleIcon />}
              />
              <Typography.Paragraph
                size="md"
                weight="bold"
                children={t("add_new")}
              />
            </div>
          </Button>
        </div>
      )}

      <CreateNewProductModal
        open={show}
        onDismiss={() => {
          setShow(false);
        }}
      />
    </>
  );
};

type Sidebar<P = {}> = FC<P> & {
  Item: typeof SidebarItem;
  Link: typeof SidebarLink;
  Brand: typeof SidebarBrand;
  Button: typeof SidebarButton;
};

export default Sidebar as Sidebar<SidebarProps>;