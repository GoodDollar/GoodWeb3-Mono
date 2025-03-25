import * as React from "react";
import { noop } from "lodash";
import { Meta } from "@storybook/react";
import { Text, View, Center } from "native-base";
import * as moment from "moment";

import { G$Amount } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";

import {
  BasicStyledModal,
  ClaimSuccessModal,
  TxDetailsModal,
  ErrorModal as ErrorModalComponent
} from "../../../core/web3/modals";
import {
  ModalFooterCta,
  ModalFooterCtaX,
  ModalFooterSocial,
  ModalErrorBody
} from "../../../core/web3/modals/BasicStyledModal";

type PagePropsAndCustomArgs = React.ComponentProps<typeof BasicStyledModal> & { footer?: string };

const meta: Meta<PagePropsAndCustomArgs> = {
  title: "Core/Modals",
  component: BasicStyledModal,
  render: args => {
    const footer =
      args.type === "cta" ? (
        <ModalFooterCta buttonText="VERIFY I'M HUMAN" action={noop} />
      ) : args.type === "ctaX" ? (
        <ModalFooterCtaX extUrl="https://www.google.com" buttonText="Click me" />
      ) : args.type === "social" ? (
        <ModalFooterSocial />
      ) : (
        args.footer || <></>
      );
    return <BasicStyledModal {...args} footer={footer} />;
  },
  argTypes: {
    withCloseButton: {
      description: "should it show a close button"
    },
    withOverlay: {
      description: "should it show an overlay",
      control: {
        type: "inline-radio",
        options: ["dark", "blur", "none"]
      }
    },
    loading: {
      description: "show animated spinner",
      control: "boolean"
    },
    type: {
      description: "type of modal",
      control: {
        type: "inline-radio",
        options: ["cta", "ctaX", "learn", "loader", "social"]
      }
    },
    title: {
      description: "title of the modal"
    },
    body: {
      description: "content of the modal"
    }
  }
};

export default meta;

export const BasicModal = {
  args: {
    withCloseButton: true,
    withOverlay: "dark",
    type: "ctaX",
    extUrl: "https://www.google.com",
    body: (
      <Text variant="sub-grey">
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua."
      </Text>
    ),
    loading: true,
    title: `This is a \n Header`,
    buttonText: "Click me"
  }
};

export const ErrorModalBody = {
  args: {
    withCloseButton: true,
    withOverlay: "dark",
    type: "loader",
    titleVariant: "title-gdred",
    title: "Oops!",
    body: <ModalErrorBody error="This is an error message" />,
    footer: (
      <View w={"100%"} ta={"center"}>
        <Center>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </Text>
        </Center>
      </View>
    )
  }
};

const transaction = {
  address: "0x123",
  network: "CELO",
  contractAddress: "0x123",
  token: "G$",
  status: "not-started",
  type: "claim-confirmed",
  date: moment.utc(),
  displayName: "GoodDollar (0x123)",
  tokenValue: undefined,
  transactionHash: "0xTransactionHash"
};

export const TransactionDetailsModal = () => {
  const tokenValue = G$Amount("G$", ethers.BigNumber.from("1000000"), 122, "fuse");
  transaction.tokenValue = tokenValue as any;

  return <TxDetailsModal open={true} tx={transaction} />;
};

export const SuccessModal = () => <ClaimSuccessModal open={true} />;

export const ErrorModal = () => (
  <ErrorModalComponent
    error="This is an error message"
    reason="This is a reason message"
    overlay="blur"
    onClose={() => undefined}
  />
);
