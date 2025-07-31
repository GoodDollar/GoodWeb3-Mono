import React, { useState, useEffect, useMemo } from "react";
import { VStack, HStack, Text, Pressable, Box, Divider } from "native-base";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const dismissed = await AsyncStorage.getItem("dismissed_claimer_tasks");
        const completed = await AsyncStorage.getItem("completed_claimer_tasks");
        if (dismissed) setDismissedTasks(JSON.parse(dismissed));
        if (completed) setCompletedTasks(JSON.parse(completed));
      } catch (error) {
        console.warn("Failed to load task data:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const dismissTask = async (taskId: string) => {
    const now = Date.now();
    const updated = { ...dismissedTasks, [taskId]: now };
    setDismissedTasks(updated);
    try {
      await AsyncStorage.setItem("dismissed_claimer_tasks", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to store dismissed task:", e);
    }
  };

  const availableTasks = useMemo(() => {
    const now = new Date();
    const fourDays = 4 * 24 * 60 * 60 * 1000;

    return SAMPLE_TASKS.filter(task => {
      const start = new Date(task.duration.startDate);
      const end = new Date(task.duration.endDate);
      if (now < start || now > end) return false;
      if (completedTasks.includes(task.id)) return false;

      const dismissed = dismissedTasks[task.id];
      if (dismissed && now.getTime() - dismissed < fourDays) return false;

      return true;
    });
  }, [dismissedTasks, completedTasks]);

  const mainTask = availableTasks.find(t => t.priority === "main");
  const secondaryTasks = availableTasks.filter(t => t.priority === "secondary");

  return {
    mainTask,
    secondaryTasks,
    loading,
    hasActiveTasks: availableTasks.length > 0,
    dismissTask
  };
};

const SimpleTaskItem: React.FC<{
  task: ClaimerTask;
  onPress: () => void;
  onDismiss: () => void;
  fontStyles?: any;
}> = ({ task, onPress, onDismiss, fontStyles }) => {
  const { subHeading, subContent } = fontStyles ?? {};

  return (
    <Pressable onPress={onPress} _pressed={{ bg: "goodGrey.50" }} py={4}>
      <HStack alignItems="center" space={3} justifyContent="space-between">
        <HStack space={3} alignItems="center" flex={1}>
          <VStack>
            <TransText t={task.title} fontSize="md" color="goodGrey.800" fontFamily="subheading" {...subHeading} />
            {task.reward && (
              <TransText
                t={task.reward.description}
                fontSize="sm"
                color="goodGrey.400"
                fontFamily="subheading"
                {...subContent}
              />
            )}
          </VStack>
        </HStack>
        <Pressable
          onPress={e => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <Text color="goodGrey.400" fontSize="lg">
            ✖️
          </Text>
        </Pressable>
      </HStack>
    </Pressable>
  );
};

interface ClaimerTasksCardProps {
  onTaskComplete?: (taskId: string) => void;
  onTaskDismiss?: (taskId: string) => void;
  fontStyles?: any;
}

export const ClaimerTasksCard: React.FC<ClaimerTasksCardProps> = ({ onTaskDismiss, fontStyles }) => {
  const { mainTask, secondaryTasks, loading, hasActiveTasks, dismissTask } = useClaimerTasks();

  const { title, subHeading, subContent, footer } = fontStyles ?? {};

  const handleDismiss = async (taskId: string) => {
    await dismissTask(taskId);
    if (onTaskDismiss) onTaskDismiss(taskId);
  };

  const openTask = async (task: ClaimerTask) => {
    if (task.actionUrl) {
      try {
        await Linking.openURL(task.actionUrl);
      } catch (error) {
        console.warn("Failed to open task URL:", error);
      }
    }
  };

  if (loading) {
    return (
      <Box bg="white" borderRadius="2xl" p={6} shadow="1" mx={4}>
        <TransText t="Loading tasks..." textAlign="center" color="goodGrey.500" {...subContent} />
      </Box>
    );
  }

  if (!hasActiveTasks) {
    return (
      <Box bg="white" borderRadius="2xl" p={6} shadow="1" mx={4}>
        <VStack alignItems="center" space={2}>
          <Text fontSize="2xl">🎉</Text>
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
            <HStack space={3} flex={1}>
              <TransText t={mainTask.title} fontSize="lg" fontWeight="bold" color="goodGrey.800" flex={1} {...title} />
            </HStack>
            <Pressable onPress={() => handleDismiss(mainTask.id)}>
              <Text color="goodGrey.400" fontSize="xl">
                ✖️
              </Text>
            </Pressable>
          </HStack>
          <TransText t={mainTask.description} fontSize="sm" color="goodGrey.500" {...subContent} />
          <TransButton t={mainTask.reward?.description || "Get Started"} onPress={() => openTask(mainTask)} />
        </VStack>
      )}

      {secondaryTasks.length > 0 && (
        <VStack space={3} px={6} pb={6}>
          <TransText
            t="MORE WAYS TO USE G$"
            fontSize="sm"
            color="goodGrey.400"
            textAlign="center"
            fontWeight="medium"
            letterSpacing="wider"
            {...subHeading}
          />
          <VStack space={1} divider={<Divider />}>
            {secondaryTasks.map(task => (
              <SimpleTaskItem
                key={task.id}
                task={task}
                onPress={() => openTask(task)}
                onDismiss={() => handleDismiss(task.id)}
                fontStyles={fontStyles}
              />
            ))}
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

export { ClaimerTasksCard as ClaimerTasksCompact };
