import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { View } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";

interface ITestAnimatedProps {
  containerStyles?: object;
  progressStyles?: object;
  progressBar?: object;
  startValue: number;
}

export const theme = {
  baseStyle: {
    containerStyles: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%"
    },
    progressStyles: {
      width: "80%",
      height: 1,
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
  ({ containerStyles, progressStyles, progressBar, startValue }: ITestAnimatedProps) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const animValueRef = useRef(0);
    // resetValue used for when in progress, and startValue is reset to 0 else the progress width will stay on last startvalue
    const [resetValue, setResetValue] = useState<number | undefined>(undefined);

    useEffect(() => {
      const progressBlock = Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 1,
          useNativeDriver: Platform.OS !== "web"
        }),
        Animated.timing(progressAnim, {
          toValue: startValue ?? 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web"
        })
      ]);

      if (!startValue) {
        setResetValue(0);
        Animated.loop(progressBlock).reset();
      } else if (startValue > animValueRef.current) {
        setResetValue(undefined);
        Animated.loop(progressBlock).start();
      }

      animValueRef.current = startValue;
    }, [startValue]);

    const progressWidth = progressAnim.interpolate({
      inputRange: [resetValue ?? animValueRef.current, 100],
      outputRange: [`${resetValue ?? animValueRef.current}%`, "100%"],
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
