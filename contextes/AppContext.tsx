import React, { ReactNode, createContext, useEffect, useRef } from "react";

import { useRouter } from "next/router";

import { AxiosResponse } from "axios";
import NProgress from "nprogress";

import { useAppDispatch, useAppSelector } from "@/hooks";
import axios from "@/lib/axios";
import { AppDispatch } from "@/store";
import {
  AppSliceStateType,
  fetchAcademyVerificationStatus,
  fetchCountries,
  fetchCurrencies,
  fetchInstalledApps
} from "@/store/slices/app-slice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps extends AppSliceStateType {
  setIsLoading: (isLoading: boolean) => void;
}

const AppContext = createContext<ContextProps>({} as ContextProps);

const AppProvider: React.FC<ProviderProps> = ({ children }) => {
  const state = useAppSelector<AppSliceStateType>((state) => state.app);
  const { user } = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const dispatch = useAppDispatch();
  const isProgressBarRunning = useRef<boolean>(false);
  const lastProgressBarRequestTime = useRef<number>(0);
  const router = useRouter();
  const { asPath } = router;

  useEffect(() => {
    if (!user.id) return;

    dispatch(fetchInstalledApps());
    dispatch(fetchCountries());
    dispatch(fetchCurrencies());
    dispatch(fetchAcademyVerificationStatus());
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: document.title ?? "" });
  }, [asPath]);

  const setIsLoading = (dispatch: AppDispatch) => (isLoading: boolean) => {
    dispatch({ type: "app/setIsLoading", payload: isLoading });
  };

  useEffect(() => {
    runProgressBar();
  }, []);

  useEffect(() => {
    if (state.isLoading) {
      runProgressBar();
    } else {
      stopProgressBar();
    }
  }, [state.isLoading]);

  useEffect(() => {
    NProgress.configure({
      showSpinner: false
    });

    return () => {
      NProgress.remove();
    };
  }, []);

  const runProgressBar = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastProgressBarRequestTime.current;

    if (timeDiff >= 0) {
      if (!isProgressBarRunning.current) {
        NProgress.start();
        isProgressBarRunning.current = true;
      }
    }

    lastProgressBarRequestTime.current = Date.now() + 500;
  };

  const stopProgressBar = () => {
    if (isProgressBarRunning.current) {
      NProgress.done();
      isProgressBarRunning.current = false;
    }
  };

  useEffect(() => {
    axios.interceptors.request.use((config) => {
      runProgressBar();

      return config;
    });

    axios.interceptors.response.use((response: AxiosResponse) => {
      stopProgressBar();

      return response;
    });

    router.events.on("routeChangeStart", runProgressBar);
    router.events.on("routeChangeComplete", stopProgressBar);
    router.events.on("routeChangeError", stopProgressBar);

    return () => {
      router.events.off("routeChangeStart", runProgressBar);
      router.events.off("routeChangeComplete", stopProgressBar);
      router.events.off("routeChangeError", stopProgressBar);
    };
  }, []);

  const provenderedValue = {
    ...state,
    setIsLoading: setIsLoading(dispatch)
  };

  return (
    <AppContext.Provider
      value={provenderedValue}
      children={children}
    />
  );
};

export { AppContext, AppProvider };
