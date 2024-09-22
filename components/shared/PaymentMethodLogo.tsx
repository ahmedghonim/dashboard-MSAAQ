import { ReactNode, useEffect, useState } from "react";

import { classNames } from "@/utils";

import { BanknotesIcon, CreditCardIcon, WalletIcon } from "@heroicons/react/24/outline";

import { Icon } from "@msaaqcom/abjad";

type PaymentMethodProps = {
  method: string;
  last4?: string;
  size?: "md" | "sm";
  className?: string;
};

export const PaymentMethodLogo = ({
  method,
  className = "divide-x divide-gray rounded border",
  last4,
  size = "md"
}: PaymentMethodProps) => {
  const [logos, setLogos] = useState<string[] | ReactNode[]>([]);

  useEffect(() => {
    if (!method) return;

    const formattedMethod = method
      .toLowerCase()
      .replaceAll(" / ", "_")
      .replaceAll("/", "_")
      .replace(/[^a-z0-9_\s]/g, "")
      .replace("apple pay", "applepay")
      .replaceAll(" ", "_")
      .toLowerCase();

    switch (formattedMethod) {
      case "applepay":
      case "apple_pay":
        return setLogos(["applepay"]);

      case "googlepay":
        return setLogos(["googlepay"]);

      case "knet":
        return setLogos(["knet"]);

      case "applepay_mada":
        return setLogos(["applepay", "mada"]);

      case "applepay_mastercard":
        return setLogos(["applepay", "master"]);

      case "applepay_visa":
        return setLogos(["applepay", "visa"]);

      case "card_mada":
      case "mada":
        return setLogos(["mada"]);

      case "card_visa":
      case "visa":
        return setLogos(["visa"]);

      case "card_amex":
      case "amex":
        return setLogos(["amex"]);

      case "paypal":
        return setLogos(["paypal"]);

      case "card_mastercard":
      case "card_master":
      case "mastercard":
      case "master":
        return setLogos(["master"]);

      case "visa_master":
        return setLogos(["visa", "master"]);

      case "pay_by_instalments":
      case "pay_now":
      case "tamara":
        return setLogos(["tamara"]);

      case "wallet":
        return setLogos([<WalletIcon key="wallet" />]);

      case "bank_transfer":
        return setLogos([<BanknotesIcon key="bank_transfer" />]);

      case "card":
      case "credit_debit_card":
        return setLogos([<CreditCardIcon key="card" />]);

      // default:
      //   console.warn("missing payment method", formattedMethod);
    }
  }, [method]);

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center">
        {logos.length ? (
          <span
            className={classNames("flex items-center", size == "md" ? "h-[30px] p-1" : "h-[25px]", className)}
            title={method}
            dir="ltr"
          >
            {logos.map((logo, index) => (
              <span
                className="px-1"
                key={index}
              >
                {typeof logo === "string" ? (
                  <img
                    src={`https://cdn.msaaq.com/assets/images/payments/${logo}.svg`}
                    alt={logo}
                    width={size == "md" ? 30 : 24}
                  />
                ) : (
                  <Icon children={logo} />
                )}
              </span>
            ))}
          </span>
        ) : (
          "—"
        )}
      </span>

      {last4 && (
        <span
          className="text-sm text-gray-900"
          children={last4}
        />
      )}
    </div>
  );
};
