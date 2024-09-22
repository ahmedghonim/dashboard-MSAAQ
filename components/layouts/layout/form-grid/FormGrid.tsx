import React, { FC, ReactNode } from "react";

import { classNames } from "@/utils";

import { Grid } from "@msaaqcom/abjad";

import DefaultSidebar from "./DefaultSidebar";
import FormActions from "./FormActions";

interface FormGridProps {
  children: ReactNode;
  sidebar?: ReactNode | any;
  sidebarFixedOnMobile?: boolean;
  sidebarAppend?: ReactNode;
  sidebarPrepend?: ReactNode;
}

const FormGrid: FC<FormGridProps> = ({
  children,
  sidebar,
  sidebarAppend,
  sidebarPrepend,
  sidebarFixedOnMobile = true,
  ...props
}) => (
  <Grid
    className={sidebarFixedOnMobile ? "pb-36 lg:pb-6" : "pb-6"}
    columns={{
      lg: sidebar ? 12 : 1,
      sm: 1
    }}
    {...props}
  >
    <Grid.Cell
      children={children}
      columnSpan={{
        lg: 8
      }}
    />

    {sidebar && (
      <Grid.Cell
        columnSpan={{
          lg: 4
        }}
      >
        <div
          className={classNames(
            sidebarFixedOnMobile && "fixed inset-x-0 bottom-0 z-20 md:mb-8 md:rtl:ml-8 md:rtl:mr-60",
            "lg:sticky lg:bottom-auto lg:top-6 lg:!mx-0"
          )}
        >
          {sidebarPrepend && sidebarPrepend}
          {sidebar.type === DefaultSidebar ? (
            sidebar
          ) : (
            <div
              className="flex flex-col gap-2 bg-primary-100 p-4 md:rounded-lg"
              id="sidebar"
              children={sidebar}
            />
          )}
          {sidebarAppend && sidebarAppend}
        </div>
      </Grid.Cell>
    )}
  </Grid>
);

type FormGridComponent<P = {}> = FC<P> & {
  Actions: typeof FormActions;
  DefaultSidebar: typeof DefaultSidebar;
};
export default FormGrid as FormGridComponent<FormGridProps>;
