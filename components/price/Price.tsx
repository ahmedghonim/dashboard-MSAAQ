import React from "react";

import { useFormatPrice } from "@/hooks";

type Props = {
  price: number;
  currency?: string;
};

const Price = ({ price, currency }: Props) => {
  const { formatPriceWithoutCurrency, formatCurrency } = useFormatPrice(currency);

  return (
    <span className="flex items-baseline gap-1">
      <strong children={formatPriceWithoutCurrency(price)} />
      <small children={formatCurrency(currency)} />
    </span>
  );
};

export default Price;
