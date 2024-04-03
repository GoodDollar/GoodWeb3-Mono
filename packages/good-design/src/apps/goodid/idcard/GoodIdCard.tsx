import React, { useMemo } from "react";
import { Center, HStack, Heading, Text, VStack, IStackProps } from "native-base";
import { useAggregatedCertificates } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme";
import SvgXml from "../../../core/images/SvgXml";
import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import GdVerifiedSvg from "../../../assets/svg/gdverified.svg";
import { truncateMiddle } from "../../../utils";

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
    verifiedValue,
    fontStyles,
    ...props
  }: {
    credentialLabel: string;
    verifiedValue?: string;
    fontStyles?: any;
  }) => {
    const { subHeading, subContent } = fontStyles ?? {};

    return (
      <VStack {...props}>
        <Text {...subHeading}>{credentialLabel}</Text>
        <HStack space={1} alignItems="center">
          <Text {...subContent}>{verifiedValue ?? `Your ${credentialLabel.toLowerCase()}`}</Text>
          {verifiedValue && (
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

    const verifiedValues = useMemo(() => {
      let Age: string | null = null,
        Gender: string | null = null,
        Country: string | null = null;

      const filtered = certificates?.filter(
        certificate => certificate.typeName === "Identity" || certificate.typeName === "Location"
      );

      filtered?.forEach(({ certificate, typeName }) => {
        const { credentialSubject } = certificate ?? {};
        if (credentialSubject && typeName === "Identity") {
          const { age: VerifiableAgeCredential, gender: VerifiableGenderCredential } = credentialSubject;

          Age = Age ?? `${VerifiableAgeCredential.from}-${VerifiableAgeCredential.to}`;
          Gender = Gender ?? VerifiableGenderCredential;
        }

        if (credentialSubject && typeName === "Location") {
          Country = Country ?? credentialSubject.countryCode;
        }
      });

      return { Age, Gender, Country };
    }, [certificates]);

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
          {Object.entries(verifiedValues).map(([label, value]) => (
            <CardRowItem key={label} credentialLabel={label} verifiedValue={value ?? "-"} />
          ))}
        </HStack>
        <HStack>
          <Text {...footer}>{expiryDate ?? "Expires on February 12, 2099"}</Text>
        </HStack>
      </VStack>
    );
  }
);

export default GoodIdCard;
