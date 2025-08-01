import React, { useState, useEffect, useMemo } from "react";
import { VStack, HStack, Pressable, Box, Divider, Spinner, useToast } from "native-base";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { TransText, TransButton } from "../../core/layout";
import { SAMPLE_TASKS } from "./mockData";

export interface TaskReward {
  type: "points" | "tokens" | "badge";
  amount?: number;
  description: string;
}

export interface ClaimerTask {
  id: string;
  title: string;
  description: string;
  category: "social" | "donation" | "referral" | "engagement";
  priority: "main" | "secondary";
  reward?: TaskReward;
  duration: { startDate: string; endDate: string };
  actionUrl?: string;
}

export const useClaimerTasks = () => {
  const [dismissedTasks, setDismissedTasks] = useState<{ [key: string]: number }>({});
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dismissed, completed] = await Promise.all([
          AsyncStorage.getItem("dismissed_claimer_tasks"),
          AsyncStorage.getItem("completed_claimer_tasks")
        ]);
        if (dismissed) setDismissedTasks(JSON.parse(dismissed));
        if (completed) setCompletedTasks(JSON.parse(completed));
      } catch (error) {
        console.warn("Failed to load task data:", error);
        toast.show({
          title: "Error",
          description: "Failed to load tasks. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const dismissTask = async (taskId: string, skipToast = false) => {
    const now = Date.now();
    const updated = { ...dismissedTasks, [taskId]: now };
    setDismissedTasks(updated);
    try {
      await AsyncStorage.setItem("dismissed_claimer_tasks", JSON.stringify(updated));
      if (!skipToast) {
        toast.show({
          title: "Task Dismissed",
          description: "Task has been dismissed."
        });
      }
    } catch (e) {
      console.warn("Failed to store dismissed task:", e);
      toast.show({
        title: "Error",
        description: "Failed to dismiss task. Please try again."
      });
    }
  };

  const dismissAllTasks = async (taskIds: string[], onTaskDismiss?: (taskId: string) => void) => {
    setDismissing(true);
    const now = Date.now();
    const updated = taskIds.reduce((acc, taskId) => ({ ...acc, [taskId]: now }), dismissedTasks);
    setDismissedTasks(updated);
    try {
      await AsyncStorage.setItem("dismissed_claimer_tasks", JSON.stringify(updated));
      taskIds.forEach(taskId => {
        if (onTaskDismiss) onTaskDismiss(taskId);
      });
      toast.show({
        title: "Tasks Dismissed",
        description: "All tasks have been dismissed."
      });
    } catch (e) {
      console.warn("Failed to store dismissed tasks:", e);
      toast.show({
        title: "Error",
        description: "Failed to dismiss tasks. Please try again."
      });
    } finally {
      setDismissing(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      toast.show({
        title: "Task Already Completed",
        description: "This task has already been completed."
      });
      return;
    }
    const updated = [...completedTasks, taskId];
    setCompletedTasks(updated);
    try {
      await AsyncStorage.setItem("completed_claimer_tasks", JSON.stringify(updated));
      toast.show({
        title: "Success",
        description: "Task completed successfully!"
      });
    } catch (e) {
      console.warn("Failed to store completed task:", e);
      toast.show({
        title: "Error",
        description: "Failed to mark task as completed. Please try again."
      });
    }
  };

  const availableTasks = useMemo(() => {
    const now = Date.now();
    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;

    return SAMPLE_TASKS.filter(task => {
      const startTime = new Date(task.duration.startDate).getTime();
      const endTime = new Date(task.duration.endDate).getTime();
      if (now < startTime || now > endTime) return false;
      if (completedTasks.includes(task.id)) return false;

      const dismissed = dismissedTasks[task.id];
      if (dismissed && now - dismissed < fourDaysMs) return false;

      return true;
    });
  }, [dismissedTasks, completedTasks]);

  const mainTask = availableTasks.find(t => t.priority === "main");
  const secondaryTasks = availableTasks.filter(t => t.priority === "secondary");

  return {
    mainTask,
    secondaryTasks,
    loading,
    dismissing,
    hasActiveTasks: availableTasks.length > 0,
    dismissTask,
    dismissAllTasks,
    completeTask
  };
};

const SimpleTaskItem: React.FC<{
  task: ClaimerTask;
  onPress: () => void;
  fontStyles?: any;
}> = ({ task, onPress, fontStyles }) => {
  const { subHeading, subContent } = fontStyles ?? {};

  return (
    <Pressable
      onPress={onPress}
      _pressed={{ bg: "gdPrimary.50" }}
      px={4}
      py={3}
      bg="white"
      borderRadius="lg"
      testID={`task-${task.id}`}
    >
      <HStack alignItems="center" space={3} justifyContent="space-between">
        <VStack flex={1}>
          <TransText t={task.title} fontSize="md" color="goodGrey.800" {...subHeading} />
          {task.reward?.description && (
            <TransText t={task.reward.description} fontSize="sm" color="goodGrey.400" {...subContent} />
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
};

interface ClaimerTasksCardProps {
  tasks?: ClaimerTask[];
  onTaskComplete?: (taskId: string) => void;
  onTaskDismiss?: (taskId: string) => void;
  fontStyles?: any;
}

export const ClaimerTasksCard: React.FC<ClaimerTasksCardProps> = ({ onTaskComplete, onTaskDismiss, fontStyles }) => {
  const { mainTask, secondaryTasks, loading, dismissing, hasActiveTasks, dismissAllTasks } = useClaimerTasks();
  const { title, subContent, footer } = fontStyles ?? {};

  const handleDismissAll = async () => {
    const taskIds = [...(mainTask ? [mainTask.id] : []), ...secondaryTasks.map(task => task.id)];
    if (taskIds.length > 0) {
      await dismissAllTasks(taskIds, onTaskDismiss);
    }
  };

  const openTask = async (task: ClaimerTask) => {
    if (task.actionUrl) {
      try {
        await Linking.openURL(task.actionUrl);
        if (onTaskComplete) onTaskComplete(task.id);
      } catch (error) {
        console.warn("Failed to open task URL:", error);
      }
    }
  };

  if (loading) {
    return (
      <Box bg="white" borderRadius="2xl" p={6} shadow="1" mx={4}>
        <HStack space={2} justifyContent="center" alignItems="center">
          <Spinner color="gdPrimary" size="sm" />
          <TransText t="Loading Tasks..." color="goodGrey.500" {...subContent} />
        </HStack>
      </Box>
    );
  }

  if (!hasActiveTasks) {
    return (
      <Box bg="white" borderRadius="2xl" p={6} shadow="1" mx={4}>
        <VStack alignItems="center" space={2}>
          <TransText t="🎉" fontSize="2xl" textAlign="center" />
          <TransText t="All caught up!" fontWeight="bold" textAlign="center" {...title} />
          <TransText
            t="Check back later for new tasks and rewards"
            color="goodGrey.500"
            textAlign="center"
            fontSize="sm"
            {...footer}
          />
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="white" borderRadius="2xl" shadow="1" mx={4} overflow="hidden">
      {mainTask && (
        <VStack space={4} p={6} pb={4}>
          <HStack alignItems="center" space={3} justifyContent="space-between">
            <TransText t={mainTask.title} fontSize="lg" fontWeight="bold" color="goodGrey.800" flex={1} {...title} />
          </HStack>
          <TransText t={mainTask.description} fontSize="sm" color="goodGrey.500" {...subContent} />
          <TransButton
            t={mainTask.reward?.description || "Start Task"}
            onPress={() => openTask(mainTask)}
            testID="main-task-button"
            borderRadius="3xl"
            bg="gdPrimary.500"
          />
        </VStack>
      )}

      {secondaryTasks.length > 0 && (
        <>
          <Divider bg="goodGrey.400" thickness="2" />
          <VStack space={3} px={6} py={4}>
            <TransText
              t="MORE WAYS TO USE G$:"
              fontSize="sm"
              textAlign="center"
              fontWeight="medium"
              letterSpacing="wider"
              {...subContent}
            />
            <VStack space={2}>
              {secondaryTasks.map(task => (
                <SimpleTaskItem key={task.id} task={task} onPress={() => openTask(task)} />
              ))}
            </VStack>
          </VStack>
        </>
      )}
      <VStack p={6}>
        <TransButton
          t="Maybe Later"
          onPress={handleDismissAll}
          testID="maybe-later-button"
          variant="outline"
          borderColor="goodGrey.300"
          _text={{ color: "goodGrey.600", ...subContent }}
          isDisabled={dismissing}
          isLoading={dismissing}
          borderRadius="3xl"
          isLoadingText="Dismissing..."
        />
      </VStack>
    </Box>
  );
};

export { ClaimerTasksCard as ClaimerTasksCompact };
