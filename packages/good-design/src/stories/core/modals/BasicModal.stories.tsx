// import React from "react";
import { BasicStyledModal } from "../../../core/web3/modals";

export default {
  title: "Core/Modals",
  component: BasicStyledModal,
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
        options: ["cta", "ctaX", "learn", "loader"]
      }
    },
    extUrl: {
      description: "url that has to be set for the modal when type is ctaX"
    },
    title: {
      description: "title of the modal"
    },
    content: {
      description: "content of the modal"
    },
    loading: {
      description: "loading state of the modal"
    },
    buttonText: {
      description: "copy for the cta(x) button"
    }
  }
};

export const BasicModal = {
  args: {
    withCloseButton: true,
    withOverlay: "dark",
    type: "ctaX",
    extUrl: "https://www.google.com",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    loading: true,
    title: "This is a header",
    buttonText: "Click me"
  }
};
