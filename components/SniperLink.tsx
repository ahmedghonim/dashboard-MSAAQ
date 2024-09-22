import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { Button, Icon } from "@msaaqcom/abjad";

interface SniperLinkGeneratorProps {
  email: string;
}

const SniperLinkGenerator: React.FC<SniperLinkGeneratorProps> = ({ email }) => {
  const { t } = useTranslation();
  const defaultEmail = process.env.NEXT_PUBLIC_SNIPER_EMAIL ?? "info@msaaq.com";
  const [fromEmail, setFromEmail] = useState<string | null>(defaultEmail);
  const [service, setService] = useState<"Gmail" | "Outlook" | "Yahoo" | "Proton" | "iCloud">("Gmail");

  const domainToService: any = {
    gmail: "Gmail",
    outlook: "Outlook",
    yahoo: "Yahoo",
    proton: "Proton",
    icloud: "iCloud"
  };

  useEffect(() => {
    if (email) {
      const domain = email.split("@")[1];
      const matchedService = Object.keys(domainToService).find((key) => domain.includes(key));
      matchedService ? setService(domainToService[matchedService]) : setFromEmail(null);
    }
  }, [email]);

  const generateLink = (): string => {
    const serviceLinks: Record<string, string> = {
      Gmail: `https://mail.google.com/mail/u/${email}/#search/from:${fromEmail}+in:anywhere`,
      Outlook: `https://outlook.live.com/mail/0/inbox/id/${fromEmail}`,
      Yahoo: `https://mail.yahoo.com/d/search/keyword=${fromEmail}`,
      Proton: `https://mail.proton.me/u/0/almost-all-mail#keyword=${fromEmail}`,
      iCloud: `https://www.icloud.com/mail/${fromEmail}`
    };

    return serviceLinks[service] || "#";
  };

  return ["Gmail", "Yahoo", "Proton"].includes(service) && fromEmail ? (
    <Button
      variant={"default"}
      icon={
        <Icon
          children={
            <img
              src={`/images/email-services/${service}.png`}
              className="h-6 w-6"
            />
          }
        />
      }
      onClick={() => window.open(generateLink(), "_blank")}
    >
      {t("auth.goto_email", { service })}
    </Button>
  ) : null;
};

export default SniperLinkGenerator;
