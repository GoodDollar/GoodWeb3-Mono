import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { View } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";

interface IAnimatedProps {
  containerStyles?: object;
  progressStyles?: object;
  progressBar?: object;
  value: number;
  animationDuration?: number;
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
    const oldValueRef = useRef(value);
    const animationDurationRef = useRef(animationDuration);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [rangeValue, setRangeValue] = useState(0);

    useEffect(() => {
      const { current: oldValue } = oldValueRef;

      const animation = {
        toValue: value,
        duration: animationDurationRef.current,
        useNativeDriver: Platform.OS !== "web"
      };
      const sequence = Animated.sequence([Animated.timing(progressAnim, animation)]);

      if (value === 0) {
        progressAnim.setValue(0);
        setRangeValue(0);
        return;
      }

      if (value === 100) {
        Animated.loop(sequence).start();
      }

      if (value > oldValue) {
        setRangeValue(oldValue);
      }

      sequence.start();

      oldValueRef.current = value;
    }, [value]);

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [`${rangeValue}%`, `100%`],
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
