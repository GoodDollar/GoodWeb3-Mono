import React from "react";
import { noop } from "lodash";
import { Meta } from "@storybook/react";

import { BasicStyledModal, ClaimSuccessModal } from "../../../core/web3/modals";
import {
  ModalFooterCta,
  ModalFooterCtaX,
  ModalFooterLearn,
  ModalFooterSocial
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
      ) : args.type === "learn" ? (
        <ModalFooterLearn source="sign" />
      ) : args.type === "social" ? (
        <ModalFooterSocial />
      ) : (
        <></>
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
    content: {
      description: "content of the modal"
    },
    loading: {
      description: "loading state of the modal"
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
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    loading: true,
    title: `This is a \n Header`,
    buttonText: "Click me"
  }
};

export const SuccessModal = () => <ClaimSuccessModal open={true} />;
