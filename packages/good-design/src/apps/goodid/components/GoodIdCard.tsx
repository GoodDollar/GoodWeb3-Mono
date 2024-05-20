import React, { useMemo } from "react";
import { Center, HStack, Text, VStack, IStackProps } from "native-base";
import { CredentialType } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme";
import SvgXml from "../../../core/images/SvgXml";
import { truncateMiddle } from "../../../utils";
import { FormattedCertificate, formatVerifiedValues } from "../../../utils/formatVerifiedValues";
import { Title } from "../../../core/layout";

import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import GdVerifiedSvg from "../../../assets/svg/gdverified.svg";
import GdUnverifiedSvg from "../../../assets/svg/gdunverified.svg";

interface GoodIdCardProps extends IStackProps {
  account: string;
  isWhitelisted: boolean;
  certificateSubjects: any;
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
    credential: FormattedCertificate;
    fontStyles?: any;
  }) => {
    const { subHeading, subContent } = fontStyles ?? {};
    const verifiedValue = useMemo(() => formatVerifiedValues(credential), [credential]);

    const verifiedCopy =
      verifiedValue === `Unverified-${credentialLabel}` ? verifiedValue.split("-")[0] : verifiedValue;

    //todo: handle initial good-id card state (onboard-screen), should show '-' for all values
    return (
      <VStack {...props}>
        <Text variant="sm-grey" fontWeight="600" {...subHeading}>
          {credentialLabel}
        </Text>
        <HStack space={1} alignItems="center">
          <Text variant="sm-grey" {...subContent}>
            {verifiedCopy}
          </Text>
          <Center mt="-3px">
            <SvgXml
              src={!["Unverified"].includes(verifiedCopy) ? GdVerifiedSvg : GdUnverifiedSvg}
              height="16"
              width="16"
              color="purple"
            />
          </Center>
        </HStack>
      </VStack>
    );
  }
);

const GoodIdCard = withTheme({ name: "GoodIdCard", skipProps: "certificates" })(
  ({ account, isWhitelisted, certificateSubjects, avatar, fullname, expiryDate, ...props }: GoodIdCardProps) => {
    const { title, subHeading, subContent, footer } = props.fontStyles ?? {};
    const truncatedAccount = truncateMiddle(account, 11);

    return (
      <VStack variant="shadow-card" paddingBottom={2} {...props}>
        <HStack justifyContent="space-between">
          <VStack>
            <Title variant="title-gdblue" {...title}>
              GoodID
            </Title>
            <HStack space={1} alignItems="center">
              <Text variant="sm-grey" fontWeight="600" {...subHeading}>
                {truncatedAccount}
              </Text>
              {isWhitelisted && (
                <Center mt="-3px">
                  <SvgXml src={GdVerifiedSvg} height="16" width="16" />
                </Center>
              )}
            </HStack>
            {fullname && (
              <Text variant="sm-grey" {...subContent}>
                {fullname}
              </Text>
            )}
          </VStack>
          <VStack justifyContent="flex-start">
            <SvgXml src={avatar ?? UnknownAvatarSvg} height="56" width="56" />
          </VStack>
        </HStack>
        <HStack space={2} flexWrap="wrap">
          {/* subjects can be empty so we use credentialtype for mapping  */}
          {Object.keys(CredentialType)
            .filter((typeName): typeName is Exclude<keyof typeof CredentialType, "Identity"> => typeName !== "Identity")
            .map(typeName => (
              <CardRowItem
                key={typeName}
                credentialLabel={typeName}
                credential={{
                  credentialSubject: certificateSubjects?.[typeName],
                  typeName: CredentialType[typeName]
                }}
              />
            ))}
        </HStack>
        <HStack>
          <Text variant="sm-grey" fontSize="2xs" {...footer}>
            {expiryDate}
          </Text>
        </HStack>
      </VStack>
    );
  }
);

export default GoodIdCard;
