import * as React from "react";
import { useContext } from "react";

import { AppContext } from "@/contextes";

interface AppLogoProps {
  defaultLogo: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ defaultLogo, ...props }) => {
  const { tenant } = useContext(AppContext);

  return (
    <img
      src={tenant?.logo ?? defaultLogo}
      alt={"MSAAQ"}
      {...props}
    />
  );
};

export default AppLogo;
