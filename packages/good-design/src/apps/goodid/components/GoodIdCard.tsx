import React, { useMemo } from "react";
import { Center, IStackProps, HStack, Text, View, VStack } from "native-base";
import { CredentialType, CredentialSubjectsByType, AsyncStorage } from "@gooddollar/web3sdk-v2";
import usePromise from "react-use-promise";

import { withTheme } from "../../../theme/hoc/withTheme";
import { truncateMiddle } from "../../../utils";
import { FormattedCertificate, formatVerifiedValues } from "../../../utils/formatVerifiedValues";
import { Title } from "../../../core/layout";
import { Image } from "../../../core/images";

import { GoodButton } from "../../../core/buttons";
import { TransText } from "../../../core/layout";
import { useGoodIdProvider } from "../context/GoodIdProvider";

import UnknownAvatarIcon from "../../../assets/images/goodid/unknown-avatar.png";
import GdVerifiedIcon from "../../../assets/images/goodid/gdverified.png";
import GdUnverifiedIcon from "../../../assets/images/goodid/gdunverified.png";

interface GoodIdCardProps extends IStackProps {
  account: string;
  isWhitelisted: boolean;
  certificateSubjects: CredentialSubjectsByType;
  avatar?: string;
  fullname?: string;
  expiryDate?: string;
  fontStyles?: any;
}

const idTypeLabels = {
  Age: /*i18n*/ "Age",
  Gender: /*i18n*/ "Gender",
  Location: /*i18n*/ "Location"
};

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

    const verifiedCopy = verifiedValue === `Unverified-${credentialLabel}` ? /*i18n*/ "Unverified" : verifiedValue;

    return (
      <VStack {...props}>
        <TransText t={credentialLabel} variant="sm-grey-650" fontWeight="600" {...subHeading} />
        <HStack space={1} alignItems="center">
          <Text variant="sm-grey-650" {...subContent}>
            {isNew ? "-" : verifiedCopy}
          </Text>

          <Center mt="-3px">
            {!isNew ? (
              <Image
                source={!["Unverified"].includes(verifiedCopy) ? GdVerifiedIcon : GdUnverifiedIcon}
                height="4"
                width="4"
              />
            ) : null}
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
    const [disputedSubjects] = usePromise(() => AsyncStorage.getItem("goodid_disputedSubjects"), []);

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
                  <Image source={GdVerifiedIcon} height="4" width="4" />
                </Center>
              )}
            </HStack>
            {fullname ? (
              <Text variant="sm-grey-650" {...subContent}>
                {fullname}
              </Text>
            ) : null}
          </VStack>
          <VStack justifyContent="flex-start">
            <Image source={avatar ?? UnknownAvatarIcon} height="14" width="14" />
          </VStack>
        </HStack>
        <HStack space={2} flexWrap="wrap">
          {/* subjects can be empty so we use credentialtype for mapping  */}
          {Object.keys(CredentialType)
            .filter((typeName): typeName is Exclude<keyof typeof CredentialType, "Identity"> => typeName !== "Identity")
            .map(typeName => (
              <View mb="2" width={typeName === "Location" ? "300%" : "48%"} key={typeName}>
                <CardRowItem
                  credentialLabel={idTypeLabels[typeName]}
                  credential={{
                    credentialSubject: certificateSubjects?.[typeName],
                    typeName: CredentialType[typeName],
                    disputedSubjects
                  }}
                  isNew={!isWhitelisted}
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
                  color="gdPrimary"
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
