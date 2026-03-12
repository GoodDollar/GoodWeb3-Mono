import { useConfig } from "@usedapp/core";
import { HStack, Link } from "native-base";
import React from "react";
import { Envs, useGetEnvChainId } from "@gooddollar/web3sdk-v2";

export const ExplorerLink = ({
  chainId,
  addressOrTx,
  text,
  fontStyle = { fontSize: "sm", fontFamily: "subheading", fontWeight: 700 },
  isPool = false,
  ...props
}: {
  chainId: number | undefined;
  addressOrTx: string | undefined;
  _icon?: any;
  text?: string;
  withIcon?: boolean;
  fontStyle?: { fontSize: string | number; fontFamily: string; fontWeight: string | number };
  maxWidth?: string | number;
  isPool?: boolean;
}) => {
  const { networks } = useConfig();
  const { baseEnv, connectedEnv } = useGetEnvChainId();
  const devEnv = connectedEnv === "fuse" ? "development" : baseEnv.split("-")[0];
  const { goodCollectiveUrl } = Envs[devEnv];

  const network = (networks || []).find(_ => _.chainId === chainId);
  const { fontSize, fontFamily, fontWeight } = fontStyle;

  const link = isPool
    ? `${goodCollectiveUrl}collective/${addressOrTx}`
    : addressOrTx &&
      network &&
      (addressOrTx.length === 42
        ? network?.getExplorerAddressLink(addressOrTx)
        : network?.getExplorerTransactionLink(addressOrTx));

  return link ? (
    <HStack space="1" maxWidth="100%">
      <Link
        _text={{
          fontSize: fontSize,
          isTruncated: true,
          fontFamily: fontFamily,
          color: "goodGrey.400",
          fontWeight: fontWeight,
          lineHeight: 25
        }}
        href={link}
        isExternal
        alignItems="center"
        flex={1}
        {...props}
      >
        {text || addressOrTx}
      </Link>
    </HStack>
  ) : null;
};
