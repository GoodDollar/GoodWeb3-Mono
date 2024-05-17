import React from "react";
import { useEthers } from "@usedapp/core";
import { Meta } from "@storybook/react";
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

import { W3Wrapper } from "../../W3Wrapper";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

import { CheckAvailableOffers, GoodIdCard } from "../../../apps/goodid";
import {
  DisputeThanks,
  OnboardScreen,
  SegmentationScreen as SegScreen,
  SegmentationConfirmation,
  SegmentationDispute
} from "../../../apps/goodid/screens";
import { SegmentationController } from "../../../apps/goodid/controllers";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example
export const GoodIdCardExample = {
  render: (args: any) => {
    const { account } = useEthers();
    const [expiryDate, , state] = useIdentityExpiryDate(account ?? "");
    const { containerStyles } = args.styles;

    return (
      <VStack width={375} space={4} {...containerStyles}>
        <Text variant="browse-wrap" fontSize="sm">
          For testing purposes. this card is using dev contracts
        </Text>
        <GoodIdCard
          account={account ?? "0x000...0000"}
          isWhitelisted={args.isWhitelisted}
          fullname={args.fullname}
          expiryDate={state === "pending" ? "-" : expiryDate?.formattedExpiryTimestamp}
        />
      </VStack>
    );
  },
  args: {
    styles: {
      containerStyles: {
        width: 375,
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
  render: (args: any) => (
    <W3Wrapper withMetaMask={true} env="staging">
      <VStack {...args}>
        <Text variant="browse-wrap" fontSize="sm">
          For testing purposes. this flow is using staging/QA contracts
        </Text>
        <SegmentationController
          onDone={async () => {
            alert("Segmentation finished");
          }}
        />
      </VStack>
    </W3Wrapper>
  ),
  args: {
    width: 375
  }
};

export const OnboardScreenExample = {
  render: () => {
    const { account } = useEthers();
    return <OnboardScreen account={account} />;
  },
  args: {}
};

export const OffersAgreementExample = {
  render: (args: any) => (
    <Wizard>
      <OffersAgreement width={375} {...args} />
    </Wizard>
  ),
  args: {
    width: 375
  }
};

export const SegmentationConfirmationScreenExample = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const [isWhitelisted] = useIsAddressVerified(account);
    const [expiryDate, , state] = useIdentityExpiryDate(account);

    return (
      <W3Wrapper withMetaMask={true}>
        <Wizard>
          <SegmentationConfirmation
            account={account}
            isWhitelisted={isWhitelisted}
            idExpiry={{ expiryDate, state }}
            {...args}
          />
        </Wizard>
      </W3Wrapper>
    );
  },
  args: {
    width: 375
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
            <Text variant="browse-wrap" fontSize="sm">
              For testing purposes, this screen is using staging/QA contracts
            </Text>
            <SegmentationDispute
              width={375}
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
    width: 375
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
        width: 375
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
      <CheckAvailableOffers
        account={account ?? args.account}
        onDone={async () => {
          alert("Finished demo");
        }}
        availableOffers={availableOffers}
      />
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
