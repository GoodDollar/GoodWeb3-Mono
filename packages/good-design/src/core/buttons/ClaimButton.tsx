import React, { useEffect, useCallback, useMemo } from "react";
import { SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { Text, View, IModalProps, Spinner, Image, FlatList, ArrowForwardIcon } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import BaseButton from "./BaseButton";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
}

export type FVModalProps = IModalProps & FVFlowProps;

interface ClaimCardContent {
  description?: string;
  imageUrl?: string;
  link?: {
    linkText: string;
    linkUrl: string;
  };
  list?: Array<{ key: string; value: string }>;
}
interface ClaimCard {
  title: string;
  content?: Array<ClaimCardContent>;
}

const mockedCards: Array<ClaimCard> = [
  {
    title: "How to claim G$",
    content: [
      { description: "First time here? Watch this video to learn the basics about GoodDollar:" },
      {
        imageUrl:
          "https://1.bp.blogspot.com/-t6rZyF0sJvc/YCe0-Xx2euI/AAAAAAAADt8/ZVlJPzwtayoLezt1fKE833GRX-n8_MHWwCLcBGAsYHQ/s400-rw/Screenshot_20210213-113418.png"
      }
    ]
  },
  {
    title: "Claimed today? Time to use your G$. 👀",
    content: [
      {
        description: `You can use your GoodDollars
      to buy products, book services, and use DeFi to better your life and the live of others.`
      },
      {
        link: {
          linkText: "Buy using G$",
          linkUrl: "https://google.com"
        }
      }
    ]
  },
  {
    title: "GoodDollar by numbers",
    content: [
      {
        list: [
          { key: "🪂 Total UBI Distributed", value: "$327.5k" },
          { key: "💰 Unique UBI Claimers", value: "$475k" },
          { key: "🚢  Market Capitalization", value: "$876k" }
        ]
      }
    ]
  }
];

const ClaimButton = withTheme()(({ firstName, method, refresh, ...props }: FVFlowProps) => {
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal } = useModal();
  const { Modal: FVModal, showModal: showFVModal, hideModal: hideFVModal } = useModal();
  const { loading, verify } = useFVModalAction({ firstName, method, onClose: hideFVModal });
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh);
  const isVerified = useQueryParam("verified");

  const handleClaim = useCallback(async () => {
    if (isWhitelisted || isVerified) {
      await claimCall.send();
      return;
    }

    showFVModal();
  }, [isWhitelisted, showFVModal, claimCall]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "Verify Uniqueness";
    }

    if (claimAmount.toNumber() > 0) {
      return `CLAIM NOW`;
    }

    return `Claim at: ${claimTime}`;
  }, [isWhitelisted, claimAmount, claimTime]);

  useEffect(() => {
    if (!isVerified || claimAmount.toNumber() <= 0) return;

    claimCall.send();
    showFirstClaimModal();
  }, [isVerified, claimAmount, showFirstClaimModal]);

  return (
    <View justifyContent="center" flex={1} w="full" {...props}>
      <Web3ActionButton
        text={buttonTitle}
        requiredChain={SupportedChains.FUSE}
        web3Action={handleClaim}
        w="169px"
        h="169px"
        px="10px"
        borderRadius="50%"
        bg="buttonBackground"
      />

      <FlatList
        data={mockedCards}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isOdd = index % 2 === 0;
          const backgroundColor = isOdd ? "#F6F8FA" : "main";
          const titleColor = isOdd ? "main" : "white";
          const descriptionColor = isOdd ? "#636363" : "white";
          return (
            <View
              w="275px"
              h="423px"
              bg={backgroundColor}
              borderRadius={30}
              flex={1}
              justifyContent="space-between"
              flexDirection="column"
              alignItems="center"
              px="17px"
              py="24px"
              key={index}
              onLayout={event => console.log(event)}
            >
              <Title color={titleColor}>{item.title}</Title>

              {item.content?.map(contentItem => {
                return (
                  <>
                    {contentItem.description && (
                      <Text color={descriptionColor} fontSize="16px" fontWeight="500" pt="16px" pb="30px">
                        {contentItem.description}
                      </Text>
                    )}

                    {contentItem.imageUrl && (
                      <Image
                        src={contentItem.imageUrl}
                        w="241px"
                        style={{ aspectRatio: 241 / 178 }}
                        borderRadius={10}
                      />
                    )}

                    {contentItem.link && (
                      <BaseButton
                        text={contentItem.link.linkText}
                        onPress={() => {}}
                        bg="white"
                        innerText={{ fontSize: "16px", fontWeight: "600", color: "main" }}
                        px="0"
                        pl="16px"
                        pr="6px"
                        innerView={{
                          width: "217px",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                        borderRadius={15}
                      >
                        <View w="46px" h="46px" bg="main" borderRadius={12} justifyContent="center" alignItems="center">
                          <ArrowForwardIcon color="white" />
                        </View>
                      </BaseButton>
                    )}
                  </>
                );
              })}
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View w="16px" />}
        pagingEnabled
        // snapToOffsets={[275 + 16, 275 + 16 + 275 + 16, 275 + 16 + 275 + 16 + 275 + 16]}
        // snapToEnd
        // snapToStart
      />

      <FVModal
        body={
          <>
            <Text color="text1">To verify your identity you need to sign TWICE with your wallet.</Text>
            <Text color="text1">First sign your address to be whitelisted</Text>
            <Text color="text1">
              Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
              your address.
            </Text>
          </>
        }
        footer={
          loading ? (
            <Spinner />
          ) : (
            <View justifyContent="space-between" width="100%" flexDirection="row">
              <ActionButton text={"Verify Uniqueness"} onPress={verify} />
            </View>
          )
        }
      />
      <FirstClaimModal
        header={
          <Text color="text1" fontWeight="bold">
            Your first claim is ready!
          </Text>
        }
        body={<Text color="text1">To complete it, sign in your wallet</Text>}
      />
    </View>
  );
});

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    bg: colorModeValue("coolGray.50", "coolGray.900")
  }))
};

export default ClaimButton;
