import React, { useRef } from "react";
import Lottie from "lottie-react-native";
import { View } from "react-native-animatable";
import { Text } from "native-base";

import SpinnerAnimate from "../../assets/lottie/spinnercheckmark/data.json";

const SpinnerCheckMark = ({ loading }: { loading: boolean }) => {
  const progress = useRef<any>(null);
  // const loop = useRef(true);

  // placeholder
  const onAnimationFinish = () => {
    console.log("should do something");
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Lottie
        style={{ width: 96 }}
        autoPlay={false}
        loop={loading}
        source={SpinnerAnimate}
        ref={progress}
        onAnimationFinish={onAnimationFinish}
      />
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Please wait while processing...
      </Text>
    </View>
  );
};

export default SpinnerCheckMark;
