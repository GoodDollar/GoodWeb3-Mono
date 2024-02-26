import React from "react";
import { HStack, Heading, Text, VStack } from "native-base";
import { CredentialTypes } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme";
import SvgXml from "../../../core/images/SvgXml";
import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import { truncateMiddle } from "../../../utils";

interface GoodIdCardProps {
  credentialsList: { credentialType: string; verifiedValue: any }[];
  account?: string;
  avatar?: string;
  fullname?: string;
  expiryDate?: string;
}

const CardRowItem = ({ credentialLabel, verifiedValue }: { credentialLabel: string; verifiedValue?: string }) => (
  <VStack w="45%">
    <Text fontFamily="subheading" fontWeight={700} color="goodGrey.600" fontSize="sm">
      {credentialLabel}
    </Text>
    <Text fontFamily="subheading" fontWeight={400} color="goodGrey.450" fontSize="xs">
      {verifiedValue ?? `Your ${credentialLabel.toLowerCase()}`}
    </Text>
  </VStack>
);

const GoodIdCard = withTheme({ name: "GoodIdCard", skipProps: "credentialsList" })(
  ({ credentialsList, account, avatar, fullname, expiryDate, ...props }: GoodIdCardProps) => {
    const truncatedAccount = truncateMiddle(account, 13);

    return (
      <VStack
        paddingX={4}
        paddingTop={4}
        paddingBottom={2}
        space={4}
        width={343}
        borderRadius={15}
        bgColor="greyCard"
        shadow="1"
        {...props}
      >
        <HStack justifyContent="space-between">
          <VStack>
            <Heading fontFamily="heading" fontSize="xl" fontWeight={700} color="primary">
              GoodID
            </Heading>
            <Text fontFamily="subheading" fontSize="md" fontWeight={600} color="goodGrey.600">
              {truncatedAccount ?? "0x000...0000"}
            </Text>
            {fullname && (
              <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
                {fullname}
              </Text>
            )}
          </VStack>
          <VStack justifyContent="flex-start">
            <SvgXml src={avatar ?? UnknownAvatarSvg} height="56" width="56" />
          </VStack>
        </HStack>
        <HStack space={2} flexWrap="wrap">
          {Object.keys(CredentialTypes).map(credentialType => (
            <CardRowItem
              key={credentialType}
              credentialLabel={CredentialTypes[credentialType as keyof typeof CredentialTypes]}
              verifiedValue={
                credentialsList?.find(credential => credential.credentialType === credentialType)?.verifiedValue
              }
            />
          ))}
        </HStack>
        {expiryDate && (
          <HStack>
            <Text fontFamily="subheading" fontSize="2xs" color="goodGrey.600">
              Expires on {expiryDate}
            </Text>
          </HStack>
        )}
      </VStack>
    );
  }
);

export default GoodIdCard;
