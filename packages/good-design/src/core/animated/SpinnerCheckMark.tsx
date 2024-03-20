import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react-native";
import { View } from "react-native-animatable";
import { Text } from "native-base";

import SpinnerAnimate from "../../assets/lottie/spinnercheckmark/data.json";

const SpinnerCheckMark = ({ loading }: { loading: boolean }) => {
  const progress = useRef<Lottie>(null);
  // const loop = useRef(true);

  // placeholder
  const onAnimationFinish = () => {
    console.log("should do something");
  };

  useEffect(() => {
    if (loading) {
      progress.current?.play(0, 130);
      return;
    }

    //todo: handle speedbump as was done before?
    progress.current?.play(130, 210);
    // todo: fix loop
    // loop.current = false;
  }, [loading]);

  return (
    <View style={{ alignItems: "center" }}>
      <Lottie
        style={{ width: 96 }}
        // autoPlay={loop.current}
        // loop={loop.current}
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
