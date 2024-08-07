import React from "react";
import { Spinner, Text, View } from "native-base";

const SpinnerCheckMark = () => {
  return (
    <View alignItems="center" borderWidth="0">
      <Spinner borderWidth="0" size="lg" color="primary" accessibilityLabel="Loading posts" paddingBottom={4} />
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Please wait while processing...
      </Text>
    </View>
  );
};

export default SpinnerCheckMark;
