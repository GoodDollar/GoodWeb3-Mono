import React from "react";
import { Meta } from "@storybook/react";
import { useEthers } from "@usedapp/core";
import {
  GoodIdContextProvider,
  useAggregatedCertificates,
  useCertificatesSubject,
  useCheckAvailableOffers,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";
import { Text, VStack } from "native-base";
import { Wizard } from "react-use-wizard";
import moment from "moment";

import { W3Wrapper } from "../../W3Wrapper";
import { useGoodId } from "../../../hooks/useGoodId";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

import { CheckAvailableOffers, GoodIdCard } from "../../../apps/goodid";
import {
  DisputeThanks,
  OnboardScreen,
  SegmentationScreen as SegScreen,
  SegmentationConfirmation,
  SegmentationDispute
} from "../../../apps/goodid/screens";
import { SegmentationController, OnboardController } from "../../../apps/goodid/controllers";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example
export const GoodIdCardExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const { certificateSubjects, expiryFormatted, isWhitelisted } = useGoodId(account);

    return (
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
      <W3Wrapper withMetaMask={true} env="staging">
        <VStack {...args}>
          <Text variant="browse-wrap" fontSize="sm">
            For testing purposes. this flow is using staging/QA contracts
          </Text>
          <SegmentationController
            {...{
              account,
              isWhitelisted,
              certificates,
              certificateSubjects,
              expiryFormatted,
              withNavBar: true
            }}
            onDone={async (e: any) => {
              console.log({ e });
              alert("Segmentation finished");
            }}
          />
        </VStack>
      </W3Wrapper>
    );
  },
  args: {
    width: "100%",
    account: "0x00"
  }
};

export const OnboardScreenExample = {
  render: args => {
    const { account = "" } = useEthers();
    const { expiryDate, styles } = args;
    const formattedExpiryTimestamp = moment(expiryDate).format("MMMM DD, YYYY");
    return (
      <OnboardScreen
        account={account}
        onAccept={() => alert("This is just a UI Demo")}
        {...args}
        expiryDate={formattedExpiryTimestamp}
        {...styles}
      />
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

export const OnboardFlowExample: Meta<React.ComponentProps<typeof OnboardController>> = {
  decorators: [
    (Story: any) => (
      <GoodIdWrapper>
        <W3Wrapper withMetaMask={true} env="staging">
          <Story />
        </W3Wrapper>
      </GoodIdWrapper>
    )
  ],
  render: args => {
    const { account } = useEthers();
    console.log({ account });
    args.account = account || args.account;
    return (
      <VStack>
        <Text w="100%" textAlign="center" fontWeight="bold" my="4">
          {`When demo/testing this story, make sure you cleared your existing certificates and permissions! (clear cache).
Also reset your location permissions for the domain. 
If you don't see a onboard screen, this means there is still a permission 'tos-accepted' in your local-storage.`}
        </Text>
        <OnboardController {...args} />
      </VStack>
    );
  },
  args: {
    account: "0x5128E3C1f8846724cc1007Af9b4189713922E4BB",
    name: "testuser",
    // onFV: () => alert("onFV"),
    onSkip: () => alert("Already verified, should go to claim-page"),
    onDone: async (e: any) => {
      alert("segmentation complemented, should go to claim-page (Available offers not part of this demo-flow)");
      console.log("onDone", e);
    },
    width: "100%"
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

export const CheckAvailableOffersExample: Meta<AvailableOffersPropsAndArgs> = {
  title: "Core/Modals",
  component: CheckAvailableOffers,
  render: args => {
    const { account } = useEthers();
    const mockPool = [
      {
        campaign: "RedTent",
        Location: {
          countryCode: args.countryCode ?? "NG"
        }
      }
    ];
    const availableOffers = useCheckAvailableOffers({ account: account ?? args.account, pools: mockPool });

    return (
      <VStack>
        <Text fontWeight="bold" my="4" textAlign="center" w="100%">
          {`If you see finished demo change in the controls the country-code the country of your certificate. \n If you have no certificates, go through the segmentation or onboard flow stories to get one.`}
        </Text>
        <CheckAvailableOffers
          account={account ?? args.account}
          onDone={async () => {
            alert("Finished demo");
          }}
          availableOffers={availableOffers}
        />
      </VStack>
    );
  },
  args: {
    countryCode: "Fill in your two-letter country-code"
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
      <GoodIdWrapper>
        <W3Wrapper withMetaMask={true} env="fuse">
          <Story />
        </W3Wrapper>
      </GoodIdWrapper>
    )
  ],
  argTypes: {}
};
