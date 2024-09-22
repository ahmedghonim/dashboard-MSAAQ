import React, { ReactNode, createContext, useEffect, useState } from "react";

import Script from "next/script";

import process from "process";

import { PaddleEventCallback, PaddleSDK } from "@/types/paddle";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  paddle: PaddleSDK | undefined;
  eventCallback: PaddleEventCallback | undefined;
}

const PaddleContext = createContext<ContextProps>({} as ContextProps);

const PaddleProvider: React.FC<ProviderProps> = ({ children }) => {
  const [paddle, setPaddle] = useState<PaddleSDK>();
  const [eventCallback, setEventCallback] = useState<PaddleEventCallback>();

  useEffect(() => {
    if (!paddle) {
      return;
    }

    if (process.env.NEXT_PUBLIC_PADDLE_SANDBOX === "true") {
      paddle.Environment.set("sandbox");
    }

    if (process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID) {
      paddle.Setup({
        vendor: parseInt(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID as string),
        eventCallback: (data) => setEventCallback(data)
      });
    }
  }, [paddle]);

  return (
    <PaddleContext.Provider value={{ paddle, eventCallback }}>
      <Script
        key="init-paddle"
        src="https://cdn.paddle.com/paddle/paddle.js"
        onLoad={() => {
          setPaddle(window.Paddle);
        }}
      />

      {children}
    </PaddleContext.Provider>
  );
};

export { PaddleProvider, PaddleContext };
