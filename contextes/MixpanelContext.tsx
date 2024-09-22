import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { GTMContext } from "@/contextes/GTMContext";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  mixpanel: Mixpanel | undefined;
}

const MixpanelContext = createContext<ContextProps>({} as ContextProps);

const MixpanelProvider: React.FC<ProviderProps> = ({ children }) => {
  const { isInitialized } = useContext(GTMContext);
  const [mixpanel, setMixpanel] = useState<Mixpanel>();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const handleMixpanel = () => {
      setMixpanel(window?.mixpanel);
    };

    window.addEventListener("load", handleMixpanel);

    return () => {
      window.removeEventListener("load", handleMixpanel);
    };
  }, [isInitialized]);

  return (
    <MixpanelContext.Provider
      value={{ mixpanel }}
      children={children}
    />
  );
};

export { MixpanelProvider, MixpanelContext };
