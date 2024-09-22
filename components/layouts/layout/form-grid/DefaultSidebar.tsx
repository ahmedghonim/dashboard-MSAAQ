import { FC } from "react";

const DefaultSidebar: FC<{ children: any }> = ({ children }) => {
  return children;
};
type DefaultSidebarComponent<P = {}> = FC<P>;
export default DefaultSidebar as DefaultSidebarComponent<{ children: any }>;
