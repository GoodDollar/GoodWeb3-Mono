import React, { useMemo } from "react";
import { Center, IStackProps, HStack, Text, View, VStack } from "native-base";
import { CredentialType, CredentialSubjectsByType } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme";
import SvgXml from "../../../core/images/SvgXml";
import { truncateMiddle } from "../../../utils";
import { FormattedCertificate, formatVerifiedValues } from "../../../utils/formatVerifiedValues";
import { Title } from "../../../core/layout";

import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import GdVerifiedSvg from "../../../assets/svg/gdverified.svg";
import GdUnverifiedSvg from "../../../assets/svg/gdunverified.svg";
import { GoodButton } from "../../../core/buttons";
import { TransText } from "../../../core/layout";
import { useGoodIdProvider } from "../context/GoodIdProvider";

interface GoodIdCardProps extends IStackProps {
  account: string;
  isWhitelisted: boolean;
  certificateSubjects: CredentialSubjectsByType;
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
    isNew,
    ...props
  }: {
    credentialLabel: string;
    credential: FormattedCertificate;
    isNew: boolean;
    fontStyles?: any;
  }) => {
    const { subHeading, subContent } = fontStyles ?? {};
    const verifiedValue = useMemo(() => formatVerifiedValues(credential), [credential]);

    const verifiedCopy =
      verifiedValue === `Unverified-${credentialLabel}` ? verifiedValue.split("-")[0] : verifiedValue;

    return (
      <VStack {...props}>
        <Text variant="sm-grey-650" fontWeight="600" {...subHeading}>
          {credentialLabel}
        </Text>
        <HStack space={1} alignItems="center">
          <Text variant="sm-grey-650" {...subContent}>
            {isNew ? "-" : verifiedCopy}
          </Text>

          <Center mt="-3px">
            <SvgXml
              src={isNew ? "-" : !["Unverified"].includes(verifiedCopy) ? GdVerifiedSvg : GdUnverifiedSvg}
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
    const { onGoToClaim } = useGoodIdProvider();
    const { title, subHeading, subContent, footer } = props.fontStyles ?? {};
    const truncatedAccount = truncateMiddle(account, 11);

    return (
      <VStack variant="shadow-card" paddingBottom={2} {...props}>
        <HStack justifyContent="space-between">
          <VStack>
            <Title variant="title-gdblue" textAlign="left" {...title}>
              {`GoodID`}
            </Title>
            <HStack space={1}>
              <Text variant="sm-grey-650" fontWeight="600" {...subHeading}>
                {truncatedAccount}
              </Text>
              {isWhitelisted && (
                <Center mt="-3px">
                  <SvgXml src={GdVerifiedSvg} height="16" width="16" />
                </Center>
              )}
            </HStack>
            {fullname && (
              <Text variant="sm-grey-650" {...subContent}>
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
              <View mb="2" width={typeName === "Location" ? "300%" : "45%"} key={typeName}>
                <CardRowItem
                  credentialLabel={typeName}
                  credential={{
                    credentialSubject: certificateSubjects?.[typeName],
                    typeName: CredentialType[typeName]
                  }}
                  isNew={!certificateSubjects}
                />
              </View>
            ))}
        </HStack>
        <VStack space={4}>
          {!certificateSubjects && onGoToClaim ? (
            <HStack space={0.5}>
              <TransText
                t={/*i18n*/ "To upgrade your GoodID, please"}
                variant="sm-grey-650"
                fontSize="2xs"
                {...footer}
              />
              <GoodButton padding={0} background="none" onPress={onGoToClaim}>
                <TransText
                  fontFamily="subheading"
                  fontSize="2xs"
                  fontWeight="600"
                  color="primary"
                  t={/*i18n*/ "Claim"}
                  underline
                />
              </GoodButton>
            </HStack>
          ) : null}
          <HStack>
            {expiryDate ? (
              <TransText
                t={/*i18n*/ "Expires on {expiryDate}"}
                values={{ expiryDate: expiryDate }}
                variant="sm-grey-650"
                fontSize="2xs"
                {...footer}
              />
            ) : null}
          </HStack>
        </VStack>
      </VStack>
    );
  }
);

export default GoodIdCard;
