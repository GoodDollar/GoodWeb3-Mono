import { RedtentWizard } from "../../../apps/goodid/wizards/RedtentWizard";
export default {
  title: "Apps/Redtent Video Wizard",
  component: RedtentWizard
};

export const RedtentWizardStory = {
  args: {
    onDone: async (error?: any) => {
      alert(`done wizard ${error}`);
    },
    onVideo: async () => {
      alert("got video");
    },
    country: "nigeria",
    containerStyles: {
      width: "100%"
    },
    headerStyles: {
      width: "100%"
    }
  }
};

export const RedtentWizardError = {
  args: {
    onDone: async (e?: Error) => {
      if (e) {
        throw e;
      }
      alert("done");
    },
    onVideo: async () => {
      alert("got video");
    },
    country: "nigeria",
    containerStyles: {
      width: "100%"
    },
    headerStyles: {
      width: "100%"
    }
  }
};
