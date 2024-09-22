import { FC, useContext } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { AuthContext } from "@/contextes";
import { useIsRouteActive } from "@/hooks";

import { Badge } from "@msaaqcom/abjad";

const SessionsTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();
  const { current_academy } = useContext(AuthContext);

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions")}
        href={{
          pathname: "/coaching-sessions"
        }}
        children={t("coaching_sessions.tabs.coaching_session")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions/appointments")}
        href={{
          pathname: "/coaching-sessions/appointments"
        }}
        children={
          <>
            <span className="flex items-center gap-3">
              {t("coaching_sessions.tabs.coaching_appointments")}
              {current_academy?.appointments_count > 0 && (
                <Badge
                  className="text-xs"
                  variant="primary"
                  rounded
                  children={current_academy?.appointments_count}
                />
              )}
            </span>
          </>
        }
      />
    </Tabs>
  );
};

export default SessionsTabs;
