import React, { ReactNode, createContext, useMemo } from "react";

import MaintenanceMode from "@/components/MaintenanceMode";
import PlatformClosed from "@/components/PlatformClosed";
import { useAppSelector } from "@/hooks";
import ServerError from "@/pages/500";
import { AppSliceStateType } from "@/store/slices/app-slice";

interface ProviderProps {
  children: ReactNode;
}

const ErrorContext = createContext({});

const ErrorProvider: React.FC<ProviderProps> = ({ children }) => {
  const { apiError } = useAppSelector<AppSliceStateType>((state) => state.app);

  const internalError = useMemo(() => apiError, [apiError]);
  return (
    <ErrorContext.Provider value={{}}>
      {internalError?.status === 503 ? (
        <MaintenanceMode />
      ) : internalError?.status === 403 ? (
        <PlatformClosed />
      ) : internalError?.status === 500 ? (
        <ServerError />
      ) : (
        children
      )}
    </ErrorContext.Provider>
  );
};

export { ErrorContext, ErrorProvider };
