import React, { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

import { useRouter } from "next/router";

import * as Sentry from "@sentry/nextjs";
import { AxiosError, AxiosResponse } from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { getSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { setLocale } from "yup";

import { LoadingScreen } from "@/components/shared/loading-screen/LoadingScreen";
import { FreshchatContext } from "@/contextes/FreshchatContext";
import { MixpanelContext } from "@/contextes/MixpanelContext";
import { isCustomizedDomain, useAppDispatch, useAppSelector } from "@/hooks";
import axios, { setAuthToken, setCurrentAcademyId, setXAcademyDomain } from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import { apiSlice, tagTypes } from "@/store/slices/api/apiSlice";
import { AuthSliceStateType, UserResponse, fetchPermissions } from "@/store/slices/auth-slice";
import { Academy, User } from "@/types";
import { Permission } from "@/types/models/permission";
import { AuthResponse } from "@/types/next-auth";
import { StringHelper, getWildcardCookiePath } from "@/utils";

import { useAbjad } from "@msaaqcom/abjad";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps extends AuthSliceStateType {
  authenticated: boolean;
  logout: () => Promise<any>;
  refetchAuth: () => Promise<{
    user: User;
    current_academy: Academy;
    academies: Academy[];
  }>;
  switchAcademy: (academyId: number, redirect?: boolean) => void;
  hasPermission: (...permission: Permission["name"][] | string[]) => boolean;
}

const AuthContext = createContext<ContextProps>({} as ContextProps);

export const CURRENT_ACADEMY_COOKIE_KEY = "current_academy";
export const ACCESS_TOKEN_COOKIE_KEY = "mq_access_token";

const AuthProvider: React.FC<ProviderProps> = ({ children }) => {
  const { t } = useTranslation();

  const { mixpanel } = useContext(MixpanelContext);
  const state = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const dispatch = useAppDispatch();
  const abjad = useAbjad();
  const router = useRouter();
  const { locale } = router;
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const { logout: clearFreshChat } = useContext(FreshchatContext);

  const logout = useCallback(async (callbackUrl = {}) => {
    await signOut(callbackUrl).finally(() => {
      deleteCookie(ACCESS_TOKEN_COOKIE_KEY, { domain: getWildcardCookiePath() });
      deleteCookie(CURRENT_ACADEMY_COOKIE_KEY, { domain: getWildcardCookiePath() });

      clearFreshChat?.();
      if (isCustomizedDomain()) {
        router.push("/");
      }
    });
  }, []);

  const fetchAuth = async () => {
    return await axios
      .get("/authentication/me")
      .then(({ data: { data } }: UserResponse) => {
        dispatch({ type: "auth/setUser", payload: data });

        setCookie("email", data.user.email);
        setCookie("name", data.user.name);

        if (getCookie("academy_id")) {
          setCurrentAcademy(getCookie("academy_id"));
          deleteCookie("academy_id");
        } else {
          if (data.current_academy) {
            setCurrentAcademy(data.current_academy.id);
          }
        }
        deleteCookie("access_token");

        setAuthenticated(true);
        return Promise.resolve(data);
      })
      .catch(async (error: AxiosError) => {
        const { response } = error;

        if (response?.status === 401) {
          deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
          deleteCookie(CURRENT_ACADEMY_COOKIE_KEY);
          await logout();
        }
        if (response?.status === 503 || response?.status === 500 || response?.status === 403) {
          dispatch({ type: "app/setApiError", payload: response });
        }
        return Promise.reject(error);
      });
  };

  const setCurrentAcademy = (currentAcademyId: any): boolean => {
    if (!currentAcademyId) {
      return false;
    }
    setCurrentAcademyId(currentAcademyId);

    abjad.setEditorPlugin("plugins.image.requestHeaders.X-Academy-ID", currentAcademyId);

    setCookie(CURRENT_ACADEMY_COOKIE_KEY, currentAcademyId, {
      domain: getWildcardCookiePath(),
      expires: dayjs().add(1, "year").toDate()
    });

    return true;
  };

  const switchAcademy = async (academyId: number, redirect: boolean = true, force: boolean = false) => {
    if (state.current_academy.id === academyId && !force) {
      return;
    }

    setCurrentAcademy(academyId);

    await fetchAuth();

    if (redirect) {
      await router.push("/");
      dispatch(apiSlice.util.invalidateTags(tagTypes as any));
    }
  };

  function hasPermission(...permission: Permission["name"][] | string[]): boolean {
    return StringHelper.is(permission, state.permissions);
  }

  useEffect(() => {
    getSession().then(async (session: AuthResponse | any) => {
      if (!session) {
        setIsReady(true);
        return;
      }

      setCookie(ACCESS_TOKEN_COOKIE_KEY, session?.access_token, {
        domain: getWildcardCookiePath(),
        expires: dayjs().add(1, "year").toDate()
      });

      if (isCustomizedDomain()) {
        setXAcademyDomain(window.location.host?.split(".").slice(1).join("."));
      }

      if (session?.access_token) {
        setAuthToken(session?.access_token);

        abjad.setEditorPlugin("plugins.image.requestHeaders", {
          Authorization: `Bearer ${session?.access_token}`
        });
      }

      if (getCookie("academy_id")) {
        setCurrentAcademy(getCookie("academy_id"));
        await fetchAuth();
      } else {
        setCurrentAcademy(getCookie(CURRENT_ACADEMY_COOKIE_KEY));
        await fetchAuth();
      }
    });
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    setIsReady(true);
    if (state.current_academy?.id) {
      dispatch(fetchPermissions()).finally(() => setIsReady(true));
    }
  }, [authenticated, state.current_academy?.id]);

  useEffect(() => {
    axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const { response } = error;

        if (response?.status === 401) {
          setAuthenticated(false);

          deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
          deleteCookie(CURRENT_ACADEMY_COOKIE_KEY);
          await logout();
        }

        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    if (!state.user?.id) {
      return;
    }

    Sentry.configureScope(function (scope) {
      scope.setUser({
        id: state.user.id.toString(),
        email: state.user.email
      });

      if (state.current_academy?.id) {
        scope.setExtra("Current Academy", {
          id: state.current_academy.id,
          domain: state.current_academy.domain,
          email: state.current_academy.email
        });
      }
    });
  }, [state.user, state.current_academy]);

  // Configure Mixpanel
  useEffect(() => {
    const { current_academy, user } = state;
    if (!user?.id || !mixpanel || !current_academy) {
      return;
    }

    mixpanel.alias(user.id.toString());
    mixpanel.alias(user.uuid, user.id.toString());
    mixpanel.alias(user.email, user.uuid);

    mixpanel.people.set({
      $email: user.email,
      $name: user.name,
      "Current Academy Domain": current_academy.domain ?? "N/A",
      "On Trial": current_academy.on_trial ? "Yes" : "No",
      "On Grace Period": current_academy.subscription?.on_grace_period ? "Yes" : "No",
      Plan: current_academy.subscription?.plan?.title ?? "N/A",
      "Plan Interval": current_academy.subscription?.price?.interval ?? "N/A"
    });
  }, [state.user, mixpanel]);

  useEffect((): void => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;

    dispatch({ type: "app/setDirection", payload: dir });

    if (locale) {
      dayjs.locale(locale);
    }
  }, [locale]);

  setLocale({
    mixed: {
      default: t("validation.field_invalid"),
      required: t("validation.field_required"),
      oneOf: ({ values }) => t("validation.field_one_of", { values: values.join(", ") })
    },
    array: {
      min: ({ min }) => t("validation.field_min_items", { min }),
      max: ({ max }) => t("validation.field_max_items", { max })
    },
    string: {
      matches: t("validation.field_invalid_format"),
      min: ({ min }) => t("validation.field_min_length", { min }),
      max: ({ max }) => t("validation.field_max_letter_count", { max }),
      email: t("validation.field_must_be_valid_email")
    },
    number: {
      min: ({ min }) => t("validation.field_number_min_length", { min }),
      max: ({ max }) => t("validation.field_number_max_length", { max })
    }
  });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        authenticated,
        refetchAuth: fetchAuth,
        switchAcademy,
        hasPermission,
        logout
      }}
      children={isReady ? children : <LoadingScreen />}
    />
  );
};

export { AuthContext, AuthProvider };
