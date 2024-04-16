import { RedtentWizard } from "../../../apps/redtent/RedtentWizard";
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
    country: "nigeria"
  }
};

export const RedtentWizardError = {
  args: {
    onDone: async (e?: Error) => {
      if (e) {
        throw new Error("error");
      }
      alert("done");
    },
    onVideo: async () => {
      alert("got video");
    },
    country: "nigeria"
  }
};
