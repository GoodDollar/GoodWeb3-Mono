import React, { useState, useEffect, useCallback } from "react";
import { Box, HStack, Text, Heading, Button, Spinner } from "native-base";
import tasksData from "./demoTasks.json";

interface Task {
  id: string;
  title: string;
  description: string;
  isMain?: boolean;
  reward?: string;
  durationDays: number;
  actionUrl?: string;
  type: string;
  creationDate: string;
}

interface UserTasksDisplayProps {
  onTaskClick?: (task: Task) => void; // Typed task parameter
  storageKeyPrefix?: string;
}

const DISMISSED_TASKS_STORAGE_KEY = "gooddollar_dismissed_user_tasks";
const DISMISS_DURATION_MS = 4 * 24 * 60 * 60 * 1000;

interface DismissedTaskInfo {
  id: string;
  dismissedAt: number;
}

export const UserTasksDisplay: React.FC<UserTasksDisplayProps> = ({ onTaskClick, storageKeyPrefix = "" }) => {
  const [mainTask, setMainTask] = useState<Task | null>(null);
  const [alternativeTasks, setAlternativeTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const storageKey = storageKeyPrefix + DISMISSED_TASKS_STORAGE_KEY;

  const getDismissedTasks = useCallback((): DismissedTaskInfo[] => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Error reading dismissed tasks from localStorage:", error);
      return [];
    }
  }, [storageKey]);

  const saveDismissedTasks = useCallback(
    (dismissed: DismissedTaskInfo[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(dismissed));
      } catch (error) {
        console.error("Error saving dismissed tasks to localStorage:", error);
      }
    },
    [storageKey]
  );

  useEffect(() => {
    setIsLoading(true);
    const loadedTasks: Task[] = tasksData;
    const now = Date.now();

    const validDismissed = getDismissedTasks().filter(
      (dt: DismissedTaskInfo) => dt.dismissedAt + DISMISS_DURATION_MS > now // Typed dt
    );
    saveDismissedTasks(validDismissed); // Clean up expired dismissals
    const dismissedIds = new Set(validDismissed.map((dt: DismissedTaskInfo) => dt.id)); // Typed dt

    const activeAndValidTasks = loadedTasks.filter(task => {
      if (dismissedIds.has(task.id)) {
        return false;
      }
      const creationTime = new Date(task.creationDate).getTime();
      const expiryTime = creationTime + task.durationDays * 24 * 60 * 60 * 1000;
      return now < expiryTime;
    });

    const main = activeAndValidTasks.find(task => task.isMain) || null;
    const alternatives = main ? activeAndValidTasks.filter(task => task.id !== main.id) : activeAndValidTasks;

    setMainTask(main);
    setAlternativeTasks(alternatives);
    setIsLoading(false);
  }, [getDismissedTasks, saveDismissedTasks]);

  const handleDismissTask = (taskId: string) => {
    const dismissedInfo: DismissedTaskInfo = { id: taskId, dismissedAt: Date.now() };
    const currentDismissed = getDismissedTasks();
    const updatedDismissed = [
      ...currentDismissed.filter((dt: DismissedTaskInfo) => dt.id !== taskId), // Typed dt
      dismissedInfo
    ];
    saveDismissedTasks(updatedDismissed);

    setMainTask((prev: Task | null) => (prev?.id === taskId ? null : prev)); // Typed prev
    setAlternativeTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId)); // Typed prev and task
  };

  const handleTaskAction = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else if (task.actionUrl) {
      window.location.href = task.actionUrl;
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p={5}>
        <Spinner size="lg" color="primary.500" />
        <Text mt={2}>Loading tasks...</Text>
      </Box>
    );
  }

  if (!mainTask && alternativeTasks.length === 0) {
    return null;
  }

  const TaskCard = ({ task, isMainCard }: { task: Task; isMainCard?: boolean }) => (
    <Box
      bg={isMainCard ? "blue.100" : "gray.100"}
      p={4}
      mb={3}
      borderRadius="md"
      shadow={isMainCard ? 3 : 1}
      borderWidth={1}
      borderColor={isMainCard ? "blue.200" : "gray.200"}
    >
      <Heading size={isMainCard ? "md" : "sm"} mb={2} color={isMainCard ? "blue.800" : "gray.800"}>
        {task.title}
      </Heading>
      <Text fontSize="sm" color="gray.600" mb={2}>
        {task.description}
      </Text>
      {task.reward && (
        <Text fontSize="sm" color="green.600" fontWeight="bold" mb={2}>
          Reward: {task.reward}
        </Text>
      )}
      <HStack justifyContent="space-between" alignItems="center" mt={3}>
        <Button
          size="sm"
          variant={isMainCard ? "solid" : "outline"}
          colorScheme={isMainCard ? "blue" : "gray"}
          onPress={() => handleTaskAction(task)}
        >
          {task.type === "vote" ? "Vote Now" : task.type === "community" ? "Learn More" : "Go to Task"}
        </Button>
        <Button size="sm" variant="ghost" colorScheme="gray" onPress={() => handleDismissTask(task.id)}>
          Dismiss
        </Button>
      </HStack>
    </Box>
  );

  return (
    <Box p={4} maxWidth="450px" mx="auto">
      {mainTask && <TaskCard task={mainTask} isMainCard />}
      {alternativeTasks.length > 0 && (
        <Box mt={mainTask ? 4 : 0}>
          {mainTask && (
            <Heading size="md" mb={3} color="gray.700">
              Other things you can do:
            </Heading>
          )}
          {alternativeTasks.map((altTask: Task) => (
            <TaskCard key={altTask.id} task={altTask} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserTasksDisplay;
