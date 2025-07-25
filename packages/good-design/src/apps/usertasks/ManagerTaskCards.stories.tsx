import React from "react";
import { ClaimerTasksCompact } from "./claimerTaskCard";
import { NativeBaseProvider } from "native-base";

export default {
  title: "UserTasks/ClaimerTasksCard",
  component: ClaimerTasksCompact
};

export const WithMockData = () => (
  <NativeBaseProvider>
    <ClaimerTasksCompact
      //tasks={tasksData}
      onTaskComplete={taskId => console.log("Task completed:", taskId)}
      onTaskDismiss={taskId => console.log("Task dismissed:", taskId)}
    />
  </NativeBaseProvider>
);

export const WithInternalData = () => (
  <NativeBaseProvider>
    <ClaimerTasksCompact />
  </NativeBaseProvider>
);
