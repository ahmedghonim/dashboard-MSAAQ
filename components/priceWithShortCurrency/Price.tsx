import { useFormatPrice } from "@/hooks";

import { Typography } from "@msaaqcom/abjad";

type Props = {
  price: number;
  currency?: string;
};

const PriceWithShortCurrency = ({ price, currency }: Props) => {
  const { formatPriceWithoutCurrency, formatCurrency, currentCurrencyLocalizeSymbol } = useFormatPrice(currency);

  return (
    <span className="flex items-baseline gap-1">
      <strong children={formatPriceWithoutCurrency(price)} />
      <Typography.Paragraph
        as="span"
        size="md"
        weight="medium"
        className="mr-2.5 text-gray-700"
        children={currentCurrencyLocalizeSymbol}
      />
    </span>
  );
};

export default PriceWithShortCurrency;
