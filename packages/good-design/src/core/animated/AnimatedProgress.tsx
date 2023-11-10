import React, { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";
import { View } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";

interface IAnimatedProps {
  containerStyles?: object;
  progressStyles?: object;
  progressBar?: object;
  value: number;
  animationDuration?: number
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
  ({ containerStyles, progressStyles, progressBar, value = 0, animationDuration = 1000 }: IAnimatedProps) => {
    const oldValueRef = useRef(value)
    const animationDurationRef = useRef(animationDuration)
    const progressAnim = useRef(new Animated.Value(value)).current;

    useEffect(() => {
      const { current: oldValue } = oldValueRef

      const animation = {
        toValue: value,
        duration: 1,
        useNativeDriver: Platform.OS !== "web"
      }

      if (value > oldValue) {
        animation.duration = animationDurationRef.current
      }

      Animated
        .sequence([
          Animated.timing(progressAnim, animation)
        ])
        .start()

      oldValueRef.current = value
    }, [value, animationDuration]);

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [`0%`, `100%`],
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
