import React, { useState, useEffect, useMemo, useCallback } from "react";
import { VStack, HStack, Pressable, Box, Spinner, useToast } from "native-base";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
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
  icon?: string;
  rewardAmount?: string;
  rewardColor?: string;
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

  const completeTask = useCallback(async (taskId: string) => {
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
  }, [completedTasks, toast]);

  const availableTasks = useMemo(() => {
    const now = moment();
    const fourDaysDuration = moment.duration(4, 'days');

    return SAMPLE_TASKS.filter(task => {
      const startTime = moment(task.duration.startDate);
      const endTime = moment(task.duration.endDate);
      
      if (now.isBefore(startTime) || now.isAfter(endTime)) return false;

      if (completedTasks.includes(task.id)) return false;

      const dismissed = dismissedTasks[task.id];
      if (dismissed) {
        const dismissedTime = moment(dismissed);
        if (now.diff(dismissedTime) < fourDaysDuration.asMilliseconds()) return false;
      }

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
      _pressed={{ bg: "gray.50" }}
      px={4}
      py={4}
      bg="white"
      borderRadius="xl"
      borderWidth={1}
      borderColor="gray.200"
      testID={`task-${task.id}`}
    >
      <HStack alignItems="center" space={4} justifyContent="space-between">
        {/* Icon */}
        <Box
          w={10}
          h={10}
          borderRadius="full"
          bg="gray.100"
          alignItems="center"
          justifyContent="center"
        >
          <TransText 
            t={task.icon || "🎯"} 
            fontSize="lg"
          />
        </Box>
        
        {/* Task content */}
        <VStack flex={1} space={1}>
          <TransText 
            t={task.title} 
            fontSize="md" 
            fontWeight="semibold"
            color="gray.800" 
            {...subHeading} 
          />
          <TransText 
            t={task.description} 
            fontSize="sm" 
            color="gray.500" 
            {...subContent} 
          />
        </VStack>

        {/* Reward */}
        <VStack alignItems="flex-end">
          <TransText 
            t={task.rewardAmount || task.reward?.description || "+0 G$"}
            fontSize="md"
            fontWeight="bold"
            color={task.rewardColor || (task.rewardAmount?.includes('-') ? "red.500" : "green.500")}
          />
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
  const { mainTask, secondaryTasks, loading, dismissing, hasActiveTasks, dismissAllTasks, completeTask } = useClaimerTasks();
  const { title, subContent, footer } = fontStyles ?? {};

  const handleDismissAll = async () => {
    const taskIds = [...(mainTask ? [mainTask.id] : []), ...secondaryTasks.map(task => task.id)];
    if (taskIds.length > 0) {
      await dismissAllTasks(taskIds, onTaskDismiss);
    }
  };

  const openTask = useCallback(async (task: ClaimerTask) => {
    if (task.actionUrl) {
      try {
        await Linking.openURL(task.actionUrl);
        await completeTask(task.id);
        if (onTaskComplete) onTaskComplete(task.id);
      } catch (error) {
        console.warn("Failed to open task URL:", error);
      }
    }
  }, [completeTask, onTaskComplete]);

  if (loading) {
    return (
      <Box bg="white" borderRadius="3xl" p={6} shadow="sm" mx={4}>
        <HStack space={2} justifyContent="center" alignItems="center">
          <Spinner color="cyan.400" size="sm" />
          <TransText t="Loading Tasks..." color="gray.500" {...subContent} />
        </HStack>
      </Box>
    );
  }

  if (!hasActiveTasks) {
    return (
      <Box bg="white" borderRadius="3xl" p={8} shadow="sm" mx={4}>
        <VStack alignItems="center" space={3}>
          <TransText t="🎉" fontSize="4xl" textAlign="center" />
          <TransText t="All caught up!" fontSize="lg" fontWeight="bold" textAlign="center" {...title} />
          <TransText
            t="Check back later for new tasks and rewards"
            color="gray.500"
            textAlign="center"
            fontSize="sm"
            {...footer}
          />
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="white" borderRadius="3xl" shadow="sm" mx={4} overflow="hidden">
      {/* Header */}
      <VStack space={2} p={6} pb={4} alignItems="center">
        <TransText 
          t="Keep the momentum going!" 
          fontSize="xl" 
          fontWeight="bold" 
          color="gray.800" 
          textAlign="center"
          {...title} 
        />
        <TransText 
          t="Here's what you can do next." 
          fontSize="md" 
          color="gray.500" 
          textAlign="center"
          {...subContent} 
        />
      </VStack>

      {/* Main Task */}
      {mainTask && (
        <VStack space={4} px={6} pb={6}>
          {/* Icon */}
          <Box alignSelf="center">
            <Box
              w={16}
              h={16}
              borderRadius="xl"
              bg="blue.500"
              alignItems="center"
              justifyContent="center"
            >
              <TransText t={mainTask.icon || "🗳️"} fontSize="2xl" />
            </Box>
          </Box>

          {/* Task Title */}
          <VStack space={2} alignItems="center">
            <TransText 
              t={mainTask.title} 
              fontSize="lg" 
              fontWeight="bold" 
              color="gray.800" 
              textAlign="center"
              {...title} 
            />
            <TransText 
              t={mainTask.description} 
              fontSize="sm" 
              color="gray.500" 
              textAlign="center"
              {...subContent} 
            />
          </VStack>

          {/* CTA Button */}
          <TransButton
            t={mainTask.reward?.description || "Cast My Vote"}
            onPress={() => openTask(mainTask)}
            testID="main-task-button"
            borderRadius="2xl"
            bg="cyan.400"
            _text={{ 
              color: "white", 
              fontSize: "md", 
              fontWeight: "semibold" 
            }}
            py={4}
          />
        </VStack>
      )}

      {/* Secondary Tasks */}
      {secondaryTasks.length > 0 && (
        <VStack space={4} px={6} pb={6}>
          <TransText
            t="More ways to use G$:"
            fontSize="sm"
            textAlign="center"
            fontWeight="medium"
            color="gray.600"
            letterSpacing="wide"
            {...subContent}
          />
          <VStack space={3}>
            {secondaryTasks.map(task => (
              <SimpleTaskItem 
                key={task.id} 
                task={task} 
                onPress={() => openTask(task)} 
                fontStyles={fontStyles}
              />
            ))}
          </VStack>
        </VStack>
      )}

      {/* Footer Button */}
      <VStack px={6} pb={6}>
        <TransButton
          t="Maybe later"
          onPress={handleDismissAll}
          testID="maybe-later-button"
          variant="ghost"
          _text={{ 
            color: "gray.500", 
            fontSize: "md",
            ...subContent 
          }}
          isDisabled={dismissing}
          isLoading={dismissing}
          isLoadingText="Dismissing..."
        />
      </VStack>
    </Box>
  );
};

export { ClaimerTasksCard as ClaimerTasksCompact };
