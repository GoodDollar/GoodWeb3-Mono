import React from "react";
import { Spinner, View } from "native-base";

import { TransText } from "../layout";

const SpinnerCheckMark = () => (
  <View alignItems="center" borderWidth="0">
    <Spinner borderWidth="0" size="lg" color="gdPrimary" accessibilityLabel="Loading posts" paddingBottom={4} />
    <TransText
      t={/*i18n*/ "Please wait while processing..."}
      comment="context: copy shown under spinner within a regular loading modal"
      fontFamily="subheading"
      fontSize="sm"
      color="goodGrey.600"
    />
  </View>
);

export default SpinnerCheckMark;
