import React, { useContext } from "react";

import Link from "next/link";

import { SubscriptionContext } from "@/contextes";

const Ksa93Banner = () => {
  const { canUseOffer } = useContext(SubscriptionContext);

  return canUseOffer ? (
    <div className="mb-8">
      <Link href={"/settings/billing/subscription/plans?interval=yearly"}>
        <img
          src={"https://cdn.msaaq.com/assets/images/banner/ksa93-banner.png"}
          alt={"عرض اليوم الوطني"}
        />
      </Link>
    </div>
  ) : null;
};

export default Ksa93Banner;
