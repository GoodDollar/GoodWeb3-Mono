import React, { useMemo } from "react";
import { Center, HStack, Heading, Text, VStack, IStackProps } from "native-base";
import { CredentialSubject, useAggregatedCertificates } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme";
import SvgXml from "../../../core/images/SvgXml";
import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import GdVerifiedSvg from "../../../assets/svg/gdverified.svg";
import { truncateMiddle } from "../../../utils";
import { formatVerifiedValues } from "../../../utils/formatVerifiedValues";

interface GoodIdCardProps extends IStackProps {
  account: string;
  isWhitelisted: boolean;
  avatar?: string;
  fullname?: string;
  expiryDate?: string;
  fontStyles?: any;
}

const CardRowItem = withTheme({ name: "CardRowItem" })(
  ({
    credentialLabel,
    credential,
    fontStyles,
    ...props
  }: {
    credentialLabel: string;
    credential?: { credentialSubject: CredentialSubject | undefined; typeName: string };
    fontStyles?: any;
  }) => {
    const { subHeading, subContent } = fontStyles ?? {};
    const verifiedValue = useMemo(() => formatVerifiedValues(credential), [credential]);

    return (
      <VStack {...props}>
        <Text {...subHeading}>{credentialLabel}</Text>
        <HStack space={1} alignItems="center">
          <Text {...subContent}>{verifiedValue === "Unverified" ? "-" : verifiedValue}</Text>
          {verifiedValue !== "Unverified" && (
            <Center mt="-3px">
              <SvgXml src={GdVerifiedSvg} height="16" width="16" />
            </Center>
          )}
        </HStack>
      </VStack>
    );
  }
);

const GoodIdCard = withTheme({ name: "GoodIdCard", skipProps: "credentialsList" })(
  ({ account, isWhitelisted, avatar, fullname, expiryDate, ...props }: GoodIdCardProps) => {
    const { title, subHeading, subContent, footer } = props.fontStyles ?? {};
    const truncatedAccount = truncateMiddle(account, 11);

    const certificates = useAggregatedCertificates(account);

    return (
      <VStack {...props}>
        <HStack justifyContent="space-between">
          <VStack>
            <Heading {...title}>GoodID</Heading>
            <HStack space={1} alignItems="center">
              <Text {...subHeading}>{truncatedAccount}</Text>
              {isWhitelisted && (
                <Center mt="-3px">
                  <SvgXml src={GdVerifiedSvg} height="16" width="16" />
                </Center>
              )}
            </HStack>
            {fullname && <Text {...subContent}>{fullname}</Text>}
          </VStack>
          <VStack justifyContent="flex-start">
            <SvgXml src={avatar ?? UnknownAvatarSvg} height="56" width="56" />
          </VStack>
        </HStack>
        <HStack space={2} flexWrap="wrap">
          {certificates?.map(({ certificate, typeName }) => {
            if (typeName === "Identity") return null;
            return (
              <CardRowItem
                key={typeName}
                credentialLabel={typeName}
                credential={{ credentialSubject: certificate?.credentialSubject, typeName }}
                fontStyles={props.fontStyles}
              />
            );
          })}
        </HStack>
        <HStack>
          <Text {...footer}>{expiryDate ?? "Expires on February 12, 2099"}</Text>
        </HStack>
      </VStack>
    );
  }
);

export default GoodIdCard;
