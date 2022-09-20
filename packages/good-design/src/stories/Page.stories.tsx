import {BaseButton} from '../core/buttons/BaseButton';

export default {
  title: 'components/Button',
  component: BaseButton,
  argTypes: {
    onPress: {
      action: 'clicked',
      description: 'The function to call when the button is pressed',
    },
    colorScheme: {
      control: {
        type: 'inline-radio',
        options: [
          'primary',
          'secondary',
          'success',
          'danger',
          'warning',
          'info',
          'light',
          'dark',
        ],
      },
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['sm', 'md', 'lg'],
      },
    },
  },
};

export const Basic = {
  args: {
    text: 'Hello World',
    colorScheme: 'primary',
    size: 'md',
  },
};


// import React from "react"
// import { ComponentStory, ComponentMeta } from "@storybook/react"
// // import { useEthers } from "@usedapp/core"
// // import { GooddollarThemeProvider } from '../core/provider/ThemeProvider'
// import { BaseButton } from "../core/buttons/BaseButton"

// export interface PageProps {
//   // user?: {};
//   // onLogin: () => void;
//   // onLogout: () => void;
//   // onCreateAccount: () => void;
// }

// // const Web3Component = () => {
// //   const library = useEthers();
// //   return (
// //     <div>
// //       <div>{library.account}</div>
// //       <div>{library.chainId}</div>
// //     </div>
// //   );
// // };
// export const Page = () => (
//   <BaseButton text="Basic Button"></BaseButton>
//   // <button>Test</button>

// );

// export default {
//   title: "Basic Button example",
//   component: Page
// } as ComponentMeta<typeof Page>;

// const Template: ComponentStory<typeof Page> = () => <Page />;

// export const MetamaskExample = Template.bind({});
