import * as React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { NativeBaseProvider, extendTheme, Box } from "native-base";
import UserTasksDisplay from "./UserTasksDisplay";

// Basic theme for NativeBase
const theme = extendTheme({
  colors: {
    primary: {
      500: "#00AED6"
    },
    blue: {
      100: "#E6F6FC",
      200: "#BEE9F7",
      800: "#006D9E"
    },
    gray: {
      100: "#F7F7F7",
      200: "#EEEEEE",
      600: "#757575",
      700: "#616161"
    },
    green: {
      600: "#388E3C"
    }
  }
});

// Wrapper component with NativeBaseProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NativeBaseProvider theme={theme}>
      <Box p={4} bg="white" minHeight="500px">
        {children}
      </Box>
    </NativeBaseProvider>
  );
};

const meta: Meta<typeof UserTasksDisplay> = {
  title: "Apps/UserTasks/UserTasksDisplay",
  component: UserTasksDisplay,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    )
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A component that displays a list of tasks for users to engage with, highlighting one main task and showing alternative options. Tasks can be dismissed for 4 days."
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof UserTasksDisplay>;

// Default story - shows the component with the default demoTasks.json data
export const Default: Story = {
  name: "Default Display",
  parameters: {
    docs: {
      description: {
        story: "This shows the default state of the component with tasks loaded from demoTasks.json."
      }
    }
  }
};

// Story with custom task click handler
export const WithTaskClickHandler: Story = {
  name: "With Custom Click Handler",
  args: {
    onTaskClick: task => {
      alert(`Task clicked: ${task.title}`);
      console.log("Task clicked:", task);
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          "This example uses a custom onTaskClick handler that shows an alert when a task is clicked instead of navigating to the URL."
      }
    }
  }
};

// Story with a different localStorage prefix for testing
export const WithCustomStoragePrefix: Story = {
  name: "With Custom Storage Prefix",
  args: {
    storageKeyPrefix: "storybook_test_"
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses a custom prefix for localStorage keys, allowing for isolated testing. Dismissing tasks in this story will not affect other stories."
      }
    }
  }
};

// This shows how to test the task dismissal functionality
export const TaskDismissal: Story = {
  name: "Task Dismissal Demo",
  args: {
    storageKeyPrefix: "dismissal_demo_"
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the task dismissal functionality. When you dismiss a task, it will be stored in localStorage and won't appear for 4 days. Try dismissing a task and then refreshing the page - it should remain dismissed."
      }
    }
  }
};

// Instructions for testing task expiry behavior
export const TaskExpiryInfo: Story = {
  name: "Task Expiry Information",
  render: () => (
    <Box p={4} borderWidth={1} borderColor="gray.200" borderRadius="md">
      <h3>Testing Task Expiry</h3>
      <p>
        The component filters out expired tasks based on their <code>creationDate</code> and <code>durationDays</code>{" "}
        values.
      </p>
      <p>To test this functionality:</p>
      <ol>
        <li>
          Modify <code>demoTasks.json</code> to change task dates
        </li>
        <li>Set some tasks with past dates + short durations to test they don't appear</li>
        <li>Set some tasks with future/recent dates to ensure they do appear</li>
      </ol>
      <p>
        <strong>Note:</strong> Task #4 in the demo data should already be expired and not visible.
      </p>
    </Box>
  )
};

// How to verify all requirements are met
export const RequirementsVerification: Story = {
  name: "Requirements Verification",
  render: () => (
    <Box p={4} borderWidth={1} borderColor="gray.200" borderRadius="md">
      <h3>Verifying All Requirements</h3>
      <p>This component fulfills the following requirements from GitHub issue #228:</p>
      <ul>
        <li>
          ✅ <strong>Main task highlighting:</strong> Check that one task is shown prominently at the top
        </li>
        <li>
          ✅ <strong>Alternative tasks display:</strong> Other tasks are shown below the main task
        </li>
        <li>
          ✅ <strong>Dismissal functionality:</strong> Click "Dismiss" on any task to hide it for 4 days
        </li>
        <li>
          ✅ <strong>Reward display:</strong> Tasks with rewards show them prominently
        </li>
        <li>
          ✅ <strong>Task duration:</strong> Tasks respect their duration period (task #4 should be expired)
        </li>
        <li>
          ✅ <strong>Action links:</strong> Clicking task buttons navigates to the specified URL or calls the
          onTaskClick callback
        </li>
        <li>
          ✅ <strong>Styling:</strong> Uses NativeBase components consistently with the design system
        </li>
      </ul>
    </Box>
  )
};
