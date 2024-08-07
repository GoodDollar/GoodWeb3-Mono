import { useConfig } from "@usedapp/core";
import { createIcon, HStack, Link } from "native-base";
import React from "react";

const LinkIcon = createIcon({
  viewBox: "0 0 448 512",
  d: "M288 32c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L306.7 128 169.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L352 173.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V64c0-17.7-14.3-32-32-32H288zM80 64C35.8 64 0 99.8 0 144V400c0 44.2 35.8 80 80 80H336c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v80c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16h80c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"
});

export const ExplorerLink = ({
  chainId,
  addressOrTx,
  text,
  withIcon = true,
  fontSize = "sm",
  fontFamily = "subheading",
  ...props
}: {
  chainId: number | undefined;
  addressOrTx: string | undefined;
  _icon?: any;
  text?: string;
  withIcon?: boolean;
  fontSize?: string;
  fontFamily?: string;
}) => {
  const { networks } = useConfig();
  const network = (networks || []).find(_ => _.chainId === chainId);
  const link =
    addressOrTx &&
    network &&
    (addressOrTx.length === 42
      ? network?.getExplorerAddressLink(addressOrTx)
      : network?.getExplorerTransactionLink(addressOrTx));

  return link ? (
    <HStack flex="2 0" alignItems="center" space="1" maxWidth={"100%"}>
      <Link
        _text={{
          fontSize: fontSize,
          isTruncated: true,
          fontFamily: fontFamily,
          color: "goodGrey.400",
          fontWeight: 700
        }}
        href={link}
        isExternal
        alignItems="center"
        flex="1 0"
        {...props}
      >
        {text || addressOrTx}
      </Link>

      {withIcon ? <LinkIcon flex="auto 0" size="3" /> : null}
    </HStack>
  ) : null;
};
