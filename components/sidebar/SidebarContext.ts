import { createContext } from "react";

export interface SidebarItemContextInterface {
  light?: boolean;
}

export const SidebarItemContext = createContext<SidebarItemContextInterface>({});
