import React, { FC, memo } from "react";
import { Box, HStack, ITextProps, Text, View } from "native-base";
import { useG$Balance, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { CurrencyValue, QueryParams } from "@usedapp/core";

interface BalanceGDProps {
  gdPrice?: number;
  refresh?: QueryParams["refresh"];
  requiredChainId?: number;
  showUsd: boolean | undefined;
}

const BalanceCopy = ({ heading, subHeading }: { heading: string; subHeading: string }) => (
  <Box mb="4">
    <Text fontSize="2xl" fontWeight="extrabold" fontFamily="heading" mb="0.5" color="main">
      {heading}
    </Text>
    <Text fontSize="sm" fontWeight="normal" fontFamily="subheading" color="goodGrey.500">
      {subHeading}
    </Text>
  </Box>
);

const BalanceView: FC<Required<BalanceGDProps> & { amount: CurrencyValue }> = memo(
  ({ gdPrice, amount, requiredChainId, showUsd }) => {
    const network = requiredChainId === 122 ? "Fuse" : "Celo";
    const usdValue = ((+amount.value / 10 ** amount.currency.decimals) * gdPrice).toFixed(2);

    const copies = [
      {
        id: "your-balance-label",
        heading: "Balance",
        subheading: `on ${network}`
      },

      {
        id: "your-balance-value",
        heading: amount.format({ suffix: "", prefix: amount.currency.ticker + " " }),
        subheading: showUsd ? "(USD " + usdValue + ")" : ""
      }
    ];

    return (
      <View w="full" flexDirection="column" alignItems="center">
        {copies.map(({ id, heading, subheading }) => (
          <BalanceCopy key={id} heading={heading} subHeading={subheading} />
        ))}
      </View>
    );
  }
);

const BalanceGD: FC<BalanceGDProps> = ({ gdPrice, requiredChainId, refresh = "never", showUsd }) => {
  const { chainId } = useGetEnvChainId(requiredChainId);
  const { G$ } = useG$Balance(refresh, chainId);

  return !G$ || !gdPrice ? null : (
    <BalanceView amount={G$} gdPrice={gdPrice} refresh={refresh} requiredChainId={chainId} showUsd={showUsd} />
  );
};

const abbreviateGd = (numberStr: string, decPlaces = 2) => {
  const number = parseFloat(numberStr);
  if (isNaN(number) || !isFinite(number)) return "NaN";

  const abbreviations = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];

  const item = abbreviations
    .slice()
    .reverse()
    .find(item => {
      return number >= item.value;
    });

  if (!item) return "0";

  const formattedNumber = (number / item.value).toFixed(decPlaces);

  const strippedNumber = parseFloat(formattedNumber);

  return strippedNumber + item.symbol;
};

export const GdAmount = ({
  amount,
  withDefaultSuffix,
  withFullBalance = true,
  ...props
}: {
  amount: CurrencyValue;
  withDefaultSuffix: boolean;
  withFullBalance?: boolean;
  color?: any;
  options?: any;
} & ITextProps) => {
  const { color, options } = props;
  const formatOptions = {
    fixedPrecisionDigits: 2,
    useFixedPrecision: true,
    significantDigits: 2,
    suffix: "",
    ...(options || {})
  };

  const decimals = amount.currency.decimals;
  const amountAbbr = abbreviateGd((Number(amount.value) / 10 ** decimals).toString());

  return (
    <HStack alignItems="flex-end">
      <Text variant="l-grey-650" fontFamily="heading" color={color} {...props} textTransform="capitalize">
        {withFullBalance ? amount?.format?.(formatOptions) : amountAbbr}
      </Text>
      {withDefaultSuffix ? (
        <Text variant="sm-grey-650" color={color} fontWeight="700" {...props}>
          {"G$"}
        </Text>
      ) : null}
    </HStack>
  );
};

export default BalanceGD;
