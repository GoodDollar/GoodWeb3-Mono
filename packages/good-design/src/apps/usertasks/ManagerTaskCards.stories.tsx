import { ClaimerTasksCompact } from "./managerTaskCard";
import { NativeBaseProvider } from "native-base";
import { action } from "@storybook/addon-actions";
import { SAMPLE_TASKS } from "./mockData";
export default {
  title: "UserTasks/ClaimerTasksCompact",
  component: ClaimerTasksCompact
};

export const WithMockData = () => (
  <NativeBaseProvider>
    <ClaimerTasksCompact
      tasks={SAMPLE_TASKS}
      onTaskComplete={action("task-completed")}
      onTaskDismiss={action("task-dismissed")}
    />
  </NativeBaseProvider>
);
