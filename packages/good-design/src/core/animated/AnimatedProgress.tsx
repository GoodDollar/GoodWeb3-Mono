import React, { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";
import { View } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";

interface ITestAnimatedProps {
  containerStyles?: object;
  progressStyles?: object;
  progressBar?: object;
  value: number;
  step: number;
}

export const theme = {
  baseStyle: {
    containerStyles: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%"
      // backgroundColor: "black"
    },
    progressStyles: {
      width: "80%",
      height: "4px",
      backgroundColor: "goodGrey.300",
      borderRadius: 5,
      overflow: "hidden"
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#00AFFF"
    }
  }
};

// based on 3 steps progress bar
const AnimatedProgress = withTheme({ name: "AnimatedProgress" })(
  ({ containerStyles, progressStyles, progressBar, value, step, ...props }: ITestAnimatedProps) => {
    const progressSteps: { [key: number]: number } = {
      1: 0,
      2: 50,
      3: 50,
      4: 100
    };

    const startValue = progressSteps[step] ?? 0;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const progressBlock = Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: value ?? 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web"
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 1,
          useNativeDriver: Platform.OS !== "web"
        })
      ]);

      Animated.loop(progressBlock).start();
    }, [value]);

    const progressWidth = progressAnim.interpolate({
      inputRange: [startValue, 100],
      outputRange: [`${startValue}%`, "100%"],
      extrapolate: "clamp"
    });

    return (
      <View {...containerStyles}>
        <View {...progressStyles}>
          <Animated.View style={[progressBar, { width: progressWidth }]} />
        </View>
      </View>
    );
  }
);

export default AnimatedProgress;
