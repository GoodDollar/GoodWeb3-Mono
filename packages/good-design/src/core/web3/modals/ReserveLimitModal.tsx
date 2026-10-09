import React from "react";
import { HStack, Link, Text, VStack } from "native-base";
import { useLingui } from "@lingui/react";

import { ErrorModal } from "./ErrorModal";

export interface ReserveLimitModalProps {
  chainId?: number;
  // The consumer supplies this only after a fresh, matching alternative Reserve check succeeds.
  otherChainId?: number;
  onClose: () => void;
}

// Full message IDs work in production even before translated catalogs are refreshed.
const messages: Record<number, { limit: string; alternative: string }> = {
  42220: {
    limit: /*i18n*/ "The Reserve’s trading limit on Celo has been reached.",
    alternative: /*i18n*/ "You can still swap on Celo."
  },
  50: {
    limit: /*i18n*/ "The Reserve’s trading limit on XDC has been reached.",
    alternative: /*i18n*/ "You can still swap on XDC."
  }
};

// Homepages follow the failed swap's origin chain; they do not assert route liquidity.
const dexRoutes = (chainId: number): { name: string; href: string }[] => {
  if (chainId === 50) return [{ name: "XSwap", href: "https://app.xspswap.finance/" }];
  if (chainId === 42220) {
    return [
      { name: "Uniswap", href: "https://app.uniswap.org/" },
      { name: "Ubeswap", href: "https://app.ubeswap.org/" }
    ];
  }
  return [];
};

export const ReserveLimitModal = ({ chainId, otherChainId, onClose }: ReserveLimitModalProps) => {
  const { i18n } = useLingui();
  if (chainId === undefined) return null;

  const otherChainMessage = otherChainId !== chainId ? messages[otherChainId ?? 0]?.alternative : undefined;

  return (
    <ErrorModal
      title={i18n._(/*i18n*/ "Reserve limit reached")}
      error={i18n._(
        messages[chainId]?.limit ?? /*i18n*/ "The Reserve’s trading limit on this network has been reached."
      )}
      overlay="blur"
      onClose={onClose}
      footer={
        <VStack space={3} alignItems="center">
          {otherChainMessage && <Text textAlign="center">{i18n._(otherChainMessage)}</Text>}
          <HStack space={4} justifyContent="center" flexWrap="wrap">
            {dexRoutes(chainId).map(({ name, href }) => (
              <Link key={name} href={href} isExternal _text={{ underline: true }}>
                {name}
              </Link>
            ))}
          </HStack>
        </VStack>
      }
    />
  );
};
