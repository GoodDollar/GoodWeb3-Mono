import * as React from "react";
import { ClaimerTasksCompact } from "./managerTaskCard";
import { NativeBaseProvider, Box } from "native-base";
import { action } from "@storybook/addon-actions";
import { SAMPLE_TASKS } from "./mockData";

export default {
  title: "UserTasks/ClaimerTasksCompact",
  component: ClaimerTasksCompact
};

export const AsModal = () => (
  <NativeBaseProvider>
        <Box flex={1} minHeight="100vh" justifyContent="center" alignItems="center">
      <ClaimerTasksCompact
        tasks={SAMPLE_TASKS}
        onTaskComplete={action("task-completed")}
        onTaskDismiss={action("task-dismissed")}
        showAsModal={true}
      />
    </Box>
  </NativeBaseProvider>
);
