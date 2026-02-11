import React, { useState, useEffect, useMemo, useCallback, FC } from "react";
import { VStack, HStack, Pressable, Box, Spinner, useToast } from "native-base";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { TransText, TransButton } from "../../core/layout";
import { SAMPLE_TASKS } from "./mockData";
import BasicStyledModal from "../../core/web3/modals/BasicStyledModal";
import { noop } from "lodash";


export interface TaskReward {
  type: "points" | "tokens" | "badge";
  amount?: number;
  description: string;
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


export interface ClaimerTask {
  type: "noTasks" | "activeTasks" | "secondaryTasks" | "modalContent" | "learn";
  taskId?: string;
  content?: string;
  id: string;
  title: string;
  description: string;
  category: "social" | "donation" | "referral" | "engagement";
  reward?: TaskReward;
  duration: { startDate: string; endDate: string };
  actionUrl?: string;
  icon?: string;
  rewardAmount?: string;
  rewardColor?: string;
  priority?: "main" | "secondary";
}

interface ManagerTaskProps {
  type: ClaimerTask["type"];
  task?: ClaimerTask;
  isPending: boolean;
  customTitle?: string;
  onClose?: () => void;
  onPress?: () => void;
  fontStyles?: any;
}

const TaskModalContent: React.FC<{ task: ClaimerTask; fontStyles?: any }> = ({ task, fontStyles }) => {
  const { subHeading, subContent } = fontStyles ?? {};

  return (
    <VStack space={4} px={2}>
      {/* Icon */}
      <Box alignSelf="center">
        <Box
          w={16}
          h={16}
          borderRadius="full"
          bg="gray.100"
          alignItems="center"
          justifyContent="center"
        >
          <TransText 
            t={task.icon || "🎯"} 
            fontSize="3xl"
          />
        </Box>
      </Box>

      {/* Task Title */}
      <TransText 
        t={task.title} 
        fontSize="lg" 
        fontWeight="bold"
        color="gray.800" 
        textAlign="center"
        {...subHeading} 
      />

      {/* Task Description */}
      <TransText 
        t={task.description}
        fontSize="md"
        color="gray.600"
        textAlign="center"
        {...subContent}
      />

      {/* Reward */}
      {task.rewardAmount && (
        <HStack justifyContent="center" space={2} alignItems="center">
          <TransText
            t="Reward:"
            fontSize="sm" 
            color="gray.500"
          />
          <TransText 
            t={task.rewardAmount || task.reward?.description || "+0 G$"}
            fontSize="lg"
            fontWeight="bold"
            color={task.rewardColor || (task.rewardAmount?.includes('-') ? "red.500" : "green.500")}
          />
        </HStack>
      )}
    </VStack>
  );
};

export const ManagerTask: FC<ManagerTaskProps> = ({
  onClose = noop,
  task,
  isPending,
  customTitle,
  onPress,
  fontStyles,
  ...props
}) => {
  if (!task) return null;

  return (
    <BasicStyledModal
      {...props}
      type="learn"
      show={isPending}
      onClose={onClose}
      title={customTitle || task.title}
      body={<TaskModalContent task={task} fontStyles={fontStyles} />}
      withOverlay="dark"
      withCloseButton={true}
      footer={
        onPress && (
          <TransButton
            t={task.reward?.description || "Complete Task"}
            onPress={onPress}
            testID={`task-action-${task.id}`}
            borderRadius="2xl"
            bg="cyan.400"
            _text={{ 
              color: "white", 
              fontSize: "md", 
              fontWeight: "semibold" 
            }}
            py={4}
            mx={6}
            mb={4}
          />
        )
      }
    />
  );
};

interface ClaimerTasksCardProps {
  tasks?: ClaimerTask[];
  onTaskComplete?: (taskId: string) => void;
  onTaskDismiss?: (taskId: string) => void;
  fontStyles?: any;
  ContentComponent?: any;
  showAsModal?: boolean;
}

const ManagerModalContent = ({ content }: { content: string }) => (
  <TransText t={content} variant="sm-grey-650" paddingLeft={2} paddingRight={2} textAlign="center" />
);

const ManagerContentDismiss = () => (
  <VStack space={2} paddingX={2}>
    <TransText t="🎉" fontSize="4xl" textAlign="center" />
    <TransText
      t={/*i18n*/ "All caught up!."}
      variant="sm-grey-650"
      fontWeight="bold"
      textAlign="center"
    />
    <TransText
      t={/*i18n*/ "Check back later for new tasks and rewards."}
      variant="sm-grey-650"
      fontWeight="bold"
      textAlign="center"
    />
  </VStack>
);

const ManagerSecondaryTasks = () => (
  <VStack space={2} paddingX={2}>
    <TransText
      t={/*i18n*/ "More ways to use G$:!."}
      variant="sm-grey-650"
      fontWeight="bold"
      textAlign="center"
    />
  </VStack>
);

const ManagerDoNextTasks = () => (
  <VStack space={2} paddingX={2}>
    <TransText
      t={/*i18n*/ "Keep the momentum going!."}
      variant="sm-grey-650"
      fontWeight="bold"
      textAlign="center"
    />
     <TransText
      t={/*i18n*/ "Here's what you can do next:"}
      variant="sm-grey-650"
      fontWeight="light"
      textAlign="center"
    />
  </VStack>
);

const DefaultContentComponent = {
  noTasks: ManagerContentDismiss,
  activeTasks: ManagerDoNextTasks,
  secondaryTasks: ManagerSecondaryTasks,
  modalContent: ManagerModalContent
};


const TasksCardContent: React.FC<{
  mainTask?: ClaimerTask;
  secondaryTasks: ClaimerTask[];
  dismissing: boolean;
  fontStyles?: any;
  ContentComponent: any;
  onTaskSelect: (task: ClaimerTask) => void;
  onDismissAll: () => void;
  ManagerModalContent: any;
}> = ({
  mainTask,
  secondaryTasks,
  dismissing,
  fontStyles,
  ContentComponent,
  onTaskSelect,
  onDismissAll,
  ManagerModalContent
}) => {
  const { secondaryTasks: ManagerSecondaryTasks } = ContentComponent;

  return (
    <VStack space={6} w="100%">
      {/* Main Task */}
      {mainTask && (
        <VStack space={4} w="100%">
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
          <Box w="100%">
            <ManagerModalContent content={mainTask.title} />
          </Box>
          <Box w="100%">
            <ManagerModalContent content={mainTask.description} />
          </Box>

          {/* CTA Button */}
          <Box w="100%">
            <TransButton
              t={mainTask.reward?.description || "Cast My Vote"}
              onPress={() => onTaskSelect(mainTask)}
              testID="main-task-button"
              variant="ghost"
            />
          </Box>
        </VStack>
      )}

      {/* Secondary Tasks */}
      {secondaryTasks.length > 0 && (
        <VStack space={4} w="100%">
          <Box w="100%">
            <ManagerSecondaryTasks />
          </Box>
          <VStack space={3} w="100%">
            {secondaryTasks.map(task => (
              <Pressable
                key={task.id}
                onPress={() => onTaskSelect(task)}
                _pressed={{ bg: "gray.50" }}
                px={4}
                py={4}
                bg="white"
                borderRadius="xl"
                borderWidth={1}
                borderColor="gray.200"
                testID={`task-${task.id}`}
                w="100%"
              >
                <HStack alignItems="center" space={4} justifyContent="space-between" w="100%">
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg="gray.100"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <TransText 
                      t={task.icon || "🎯"} 
                      fontSize="lg"
                    />
                  </Box>
                  
                  <VStack flex={1} space={1} minW={0}>
                    <TransText 
                      t={task.title} 
                      fontSize="md" 
                      fontWeight="semibold"
                      color="gray.800" 
                      {...fontStyles?.subHeading} 
                    />
                    <TransText 
                      t={task.description} 
                      fontSize="sm" 
                      color="gray.500" 
                      {...fontStyles?.subContent} 
                      numberOfLines={2}
                    />
                  </VStack>

                  <VStack alignItems="flex-end" flexShrink={0}>
                    <TransText 
                      t={task.rewardAmount || task.reward?.description || "+0 G$"}
                      fontSize="md"
                      fontWeight="bold"
                      color={task.rewardColor || (task.rewardAmount?.includes('-') ? "red.500" : "green.500")}
                    />
                  </VStack>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Footer Button */}
      <Box w="100%">
        <TransButton
          t="Maybe later"
          onPress={onDismissAll}
          testID="maybe-later-button"
          variant="ghost"
          isDisabled={dismissing}
          isLoading={dismissing}
          isLoadingText="Dismissing..."
        />
      </Box>
    </VStack>
  );
};

export const ClaimerTasksCard: React.FC<ClaimerTasksCardProps> = ({ 
  onTaskComplete, 
  onTaskDismiss, 
  fontStyles, 
  ContentComponent = DefaultContentComponent,
  showAsModal = true 
}) => {
  const { mainTask, secondaryTasks, loading, dismissing, hasActiveTasks, dismissAllTasks, completeTask } = useClaimerTasks();
  const [selectedTask, setSelectedTask] = useState<ClaimerTask | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);

  const ManagerModalContent = ContentComponent.modalContent;
  const ManagerContentDismiss = ContentComponent.noTasks;
  const ManagerDoNextTasks = ContentComponent.activeTasks;

  const handleDismissAll = async () => {
    const taskIds = [...(mainTask ? [mainTask.id] : []), ...secondaryTasks.map(task => task.id)];
    if (taskIds.length > 0) {
      await dismissAllTasks(taskIds, onTaskDismiss);
      setShowMainModal(false);
    }
  };

  const openTask = useCallback(async (task: ClaimerTask) => {
    if (task.actionUrl) {
      try {
        await Linking.openURL(task.actionUrl);
        await completeTask(task.id);
        if (onTaskComplete) onTaskComplete(task.id);
        setSelectedTask(null);
      } catch (error) {
        console.warn("Failed to open task URL:", error);
      }
    }
  }, [completeTask, onTaskComplete]);

  const handleTaskSelect = (task: ClaimerTask) => {
    if (task.id === mainTask?.id) {
      void openTask(task);
    } else {
      setSelectedTask(task);
    }
  };

  useEffect(() => {
    if (!loading && hasActiveTasks && showAsModal) {
      setShowMainModal(true);
    }
  }, [loading, hasActiveTasks, showAsModal]);

  if (loading) {
    return (
      <Box bg="white" borderRadius="3xl" p={6} shadow="sm" mx={4}>
        <HStack space={2} justifyContent="center" alignItems="center">
          <Spinner color="cyan.400" size="sm" />
        </HStack>
      </Box>
    );
  }

  if (!hasActiveTasks) {
    return (
        <BasicStyledModal
      type="learn"
      show={true}
      onClose={() => {/* handle close - maybe navigate away? */}}
      title=""
      body={<ManagerContentDismiss />}
      withOverlay="dark"
      withCloseButton={true}
    />
    );
  }

  if (!showAsModal) {
    return (
      <Box bg="white" borderRadius="3xl" shadow="sm" m={4} overflow="visible" width="100%" maxW="500px">
        <VStack space={4} p={6} width="100%">
          <Box width="100%">
            <ManagerDoNextTasks />
          </Box>
          <TasksCardContent
            mainTask={mainTask}
            secondaryTasks={secondaryTasks}
            dismissing={dismissing}
            fontStyles={fontStyles}
            ContentComponent={ContentComponent}
            onTaskSelect={handleTaskSelect}
            onDismissAll={handleDismissAll}
            ManagerModalContent={ManagerModalContent}
          />
        </VStack>

        {/* Individual Task Modal */}
        {selectedTask && (
          <ManagerTask
            type="modalContent"
            task={selectedTask}
            isPending={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onPress={() => void openTask(selectedTask)}
            fontStyles={fontStyles}
          />
        )}
      </Box>
    );
  }

  return (
    <>
      {/* Main Tasks Modal */}
      <BasicStyledModal
        type="learn"
        show={showMainModal}
        onClose={() => setShowMainModal(false)}
        title=""
        body={
          <VStack space={4}>
            <ManagerDoNextTasks />
            <TasksCardContent
              mainTask={mainTask}
              secondaryTasks={secondaryTasks}
              dismissing={dismissing}
              fontStyles={fontStyles}
              ContentComponent={ContentComponent}
              onTaskSelect={handleTaskSelect}
              onDismissAll={handleDismissAll}
              ManagerModalContent={ManagerModalContent}
            />
          </VStack>
        }
        withOverlay="dark"
        withCloseButton={true}
      />

      {/* Individual Task Modal */}
      {selectedTask && (
        <ManagerTask
          type="modalContent"
          task={selectedTask}
          isPending={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onPress={() => void openTask(selectedTask)}
          fontStyles={fontStyles}
        />
      )}
    </>
  );
};

export { ClaimerTasksCard as ClaimerTasksCompact };