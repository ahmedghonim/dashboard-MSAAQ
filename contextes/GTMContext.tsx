import React, { ReactNode, createContext, useEffect, useState } from "react";

import process from "process";
import TagManager from "react-gtm-module";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  isInitialized: boolean;
}

const GTMContext = createContext({} as ContextProps);

const GTMProvider: React.FC<ProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID) {
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID });

      setIsInitialized(true);
    }
  }, []);

  return (
    <GTMContext.Provider
      value={{
        isInitialized
      }}
      children={children}
    />
  );
};

export { GTMContext, GTMProvider };
