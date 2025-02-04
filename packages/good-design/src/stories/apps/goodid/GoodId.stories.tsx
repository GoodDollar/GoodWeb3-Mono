import React from "react";
import { Meta } from "@storybook/react";
import { useEthers } from "@usedapp/core";
import {
  GoodIdContextProvider,
  SupportedChains,
  useAggregatedCertificates,
  useCertificatesSubject,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";
import { HStack, Spinner, Text, VStack } from "native-base";
import { Wizard } from "react-use-wizard";
import moment from "moment";
import { Provider } from "react-native-paper";

import { GoodButton } from "../../../core/buttons";
import { W3Wrapper } from "../../W3Wrapper";
import { useGoodId } from "../../../hooks/useGoodId";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";
import { GoodIdProvider } from "../../../apps/goodid/context/GoodIdProvider";

import { CheckAvailableOffers, GoodIdCard } from "../../../apps/goodid";
import {
  DisputeThanks,
  OnboardScreen,
  SegmentationScreen as SegScreen,
  SegmentationConfirmation,
  SegmentationDispute
} from "../../../apps/goodid/screens";
import { SegmentationController, OnboardController } from "../../../apps/goodid/controllers";
import { GoodUIi18nProvider, useGoodUILanguage } from "../../../theme";
import { ClaimProvider } from "../../../apps/ubi";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example
export const GoodIdCardExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const { certificateSubjects, expiryFormatted, isWhitelisted } = useGoodId(account);

    return (
      <GoodIdProvider onGoToClaim={() => alert("Should navigate to the claim-page")}>
        <VStack {...args.styles.containerStyles}>
          <Text variant="browse-wrap" fontSize="sm">
            For testing purposes. this card is using dev contracts
          </Text>
          <GoodIdCard
            account={account ?? "0x000...0000"}
            certificateSubjects={certificateSubjects}
            isWhitelisted={args.isWhitelisted || isWhitelisted}
            fullname={args.fullName}
            expiryDate={expiryFormatted}
          />
        </VStack>
      </GoodIdProvider>
    );
  },
  args: {
    styles: {
      containerStyles: {
        width: "100%",
        space: 4
      }
    },
    isWhitelisted: false,
    fullname: "Just a name"
  }
};

export const SegmentationScreen = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const certificates = useAggregatedCertificates(args.account ?? account);
    const certificateSubjects = useCertificatesSubject(certificates);

    return (
      <W3Wrapper withMetaMask={true}>
        <SegScreen certificateSubjects={certificateSubjects} />
      </W3Wrapper>
    );
  },
  args: {}
};

export const SegmentationFlow = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const { certificates, certificateSubjects, expiryFormatted, isWhitelisted } = useGoodId(account);

    return (
      <W3Wrapper withMetaMask={true} env={args.env}>
        <Provider>
          <GoodIdProvider onGoToClaim={() => alert("Should navigate to the claim-page")}>
            <VStack {...args}>
              <Text variant="browse-wrap" fontSize="sm">
                For testing purposes. this flow is using staging/QA contracts
              </Text>
              <VStack alignItems="center" minHeight="850">
                <SegmentationController
                  {...{
                    account,
                    isWhitelisted,
                    certificates,
                    certificateSubjects,
                    expiryFormatted,
                    withNavBar: true,
                    isDev: true
                  }}
                  onDone={async (e: any) => {
                    console.log({ e });
                    alert("Segmentation finished");
                  }}
                />
              </VStack>
            </VStack>
          </GoodIdProvider>
        </Provider>
      </W3Wrapper>
    );
  },
  args: {
    width: "100%",
    account: "0x00",
    env: "fuse"
  }
};

export const OnboardScreenExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const { expiryDate, styles } = args;
    const formattedExpiryTimestamp = moment(expiryDate).format("MMMM DD, YYYY");
    return (
      <GoodIdProvider>
        <OnboardScreen
          account={account}
          onAccept={() => alert("This is just a UI Demo")}
          {...args}
          expiryDate={formattedExpiryTimestamp}
          {...styles}
        />
      </GoodIdProvider>
    );
  },
  args: {
    name: "test user",
    account: "0x066",
    isWhitelisted: true,
    isPending: false,
    hasCertificates: false,
    expiryDate: new Date().getTime(),
    styles: {
      width: "100%"
    }
  }
};

export const OnboardFlowExample: Meta<React.ComponentProps<typeof OnboardController> & { defaultLanguage: string }> = {
  decorators: [
    (Story: any) => (
      <GoodUIi18nProvider defaultLanguage="es-419">
        <Provider>
          <GoodIdWrapper>
            <GoodIdProvider>
              <W3Wrapper withMetaMask={true} env="staging">
                <Story />
              </W3Wrapper>
            </GoodIdProvider>
          </GoodIdWrapper>
        </Provider>
      </GoodUIi18nProvider>
    )
  ],
  render: args => {
    const { account } = useEthers();
    const { setLanguage } = useGoodUILanguage();

    return (
      <VStack>
        <Text w="100%" textAlign="center" fontWeight="bold" my="4">
          {`When demo/testing this story, make sure you cleared your existing certificates and permissions! (clear cache).
Also reset your location permissions for the domain. 
If you don't see a onboard screen, this means there is still a permission 'tos-accepted' in your local-storage.`}
        </Text>
        <HStack width="200">
          <GoodButton onPress={() => setLanguage("es-419")}>Spanish</GoodButton>
          <GoodButton onPress={() => setLanguage("en")}>English</GoodButton>
        </HStack>

        <OnboardController {...args} account={account ?? ""} />
      </VStack>
    );
  },
  args: {
    name: "testuser",
    // onFV: () => alert("onFV"),
    onSkip: () => alert("Already verified, should go to claim-page"),
    onDone: async (e: any) => {
      alert("segmentation complemented, should go to claim-page (Available offers not part of this demo-flow)");
      console.log("onDone", e);
    },
    onExit: () => alert("Should exit the flow"),
    width: "100%",
    withNavBar: true,
    isDev: true
  }
};

export const OffersAgreementExample = {
  render: (args: any) => (
    <Wizard>
      <OffersAgreement {...args} />
    </Wizard>
  ),
  args: {
    width: "100%"
  }
};

export const SegmentationConfirmationScreenExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const [isWhitelisted] = useIsAddressVerified(account);
    const [expiryDate, , state] = useIdentityExpiryDate(account);
    const certificates = useAggregatedCertificates(args.account ?? account);
    const certificateSubjects = useCertificatesSubject(certificates);

    return (
      <W3Wrapper withMetaMask={true}>
        <GoodIdProvider>
          <Wizard>
            <SegmentationConfirmation
              {...{
                account,
                isWhitelisted,
                idExpiry: { expiryDate, state },
                certificateSubjects
              }}
              {...args}
            />
          </Wizard>
        </GoodIdProvider>
      </W3Wrapper>
    );
  },
  args: {
    width: "100%"
  }
};

export const SegmentationDisputeScreenExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const certificates = useAggregatedCertificates(account);
    const certificateSubjects = useCertificatesSubject(certificates);

    return (
      <W3Wrapper withMetaMask={true} env="staging">
        <Wizard>
          <VStack>
            <Text variant="browse-wrap" fontSize="sm" fontWeight="bold">
              For testing purposes, this screen is using staging/QA contracts
            </Text>
            <SegmentationDispute
              certificateSubjects={certificateSubjects}
              onDispute={async disputedValues => {
                console.log("Following is to be reported to ga/amp:", { disputedValues });
              }}
              {...args}
            />
          </VStack>
        </Wizard>
      </W3Wrapper>
    );
  },
  args: {
    width: "100%"
  }
};

export const DisputeThanksScreenExample = {
  render: (args: any) => {
    const { containerStyles, screenStyles } = args.styles;
    return (
      <W3Wrapper withMetaMask={true}>
        <Wizard>
          <VStack {...containerStyles}>
            <DisputeThanks {...screenStyles} />
          </VStack>
        </Wizard>
      </W3Wrapper>
    );
  },
  args: {
    styles: {
      containerStyles: {
        width: "100%"
      },
      screenStyles: {}
    }
  }
};

type AvailableOffersPropsAndArgs = React.ComponentProps<typeof CheckAvailableOffers> & { countryCode?: string };

const explorerEndPoints = {
  CELO: "https://api.celoscan.io/api?apikey=WIX677MWRWNYWXTRCFKBK2NZAB2XHYBQ3K&",
  FUSE: "https://explorer.fuse.io/api?",
  MAINNET: ""
};

type ClaimArgs = {
  claimArgs: {
    onNews: () => void;
    onUpgrade: () => void;
    isDev: boolean;
  };
};

export const CheckAvailableOffersExample: Meta<AvailableOffersPropsAndArgs & ClaimArgs> = {
  title: "Core/Modals",
  component: CheckAvailableOffers,
  render: args => {
    const { account, chainId } = useEthers();
    // const mockPool = [
    //   {
    //     campaign: "RedTent",
    //     Location: {
    //       countryCode: args.countryCode ?? "NG"
    //     }
    //   }
    // ];
    const { setLanguage } = useGoodUILanguage();

    if (!chainId) return <Spinner variant="page-loader" />;

    return (
      <Provider>
        <ClaimProvider
          {...args.claimArgs}
          //dev pools
          activePoolAddresses={[
            "0x77253761353271813c1aca275de8eec768b217c5",
            "0x627dbf00ce1a54067f5a34d6596a217a029c1532"
          ]}
          explorerEndPoints={explorerEndPoints}
          supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
          withSignModals
          withNewsFeed
        >
          <VStack>
            <HStack width="200">
              <GoodButton onPress={() => setLanguage("en")}>English</GoodButton>
              <GoodButton onPress={() => setLanguage("es-419")}>Spanish</GoodButton>
            </HStack>
            <Text fontWeight="bold" my="4" textAlign="center" w="100%">
              {`If you see finished demo change in the controls the country-code the country of your certificate. \n If you have no certificates, go through the segmentation or onboard flow stories to get one.`}
            </Text>
            <CheckAvailableOffers
              chainId={chainId}
              account={account ?? args.account}
              onDone={async () => {
                alert("Finished demo");
              }}
              withNavBar={true}
              isDev={true}
            />
          </VStack>
        </ClaimProvider>
      </Provider>
    );
  },
  args: {
    countryCode: "Fill in your two-letter country-code",
    claimArgs: {
      onNews: () => {
        alert("Should go to news page");
      },
      onUpgrade: () => {
        alert("Should go to goodid upgrade page");
      },
      isDev: true
    }
  },
  argTypes: {
    account: {
      description: "User account address, the wallet you currently are connected with."
    },
    countryCode: {
      description: "What country are you located in?"
    }
  }
};

export default {
  title: "Apps/GoodId",
  component: GoodIdCard,
  decorators: [
    (Story: any) => (
      <GoodUIi18nProvider defaultLanguage="es-419">
        <GoodIdWrapper>
          <W3Wrapper withMetaMask={true} env="fuse">
            <Story />
          </W3Wrapper>
        </GoodIdWrapper>
      </GoodUIi18nProvider>
    )
  ],
  argTypes: {
    language: {
      description: "Set the language of the UI",
      control: {
        type: "text"
      }
    }
  }
};
