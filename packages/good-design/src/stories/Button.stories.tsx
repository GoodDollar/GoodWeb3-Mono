import {BaseButton} from '../core/buttons/BaseButton';

export default {
  title: 'Core/Basic',
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