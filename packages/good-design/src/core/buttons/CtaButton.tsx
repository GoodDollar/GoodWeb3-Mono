import React from "react";
import { View } from "native-base";

import ArrowButton from "./ArrowButton";

export const CtaButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <View justifyContent="center" width="full" flexDirection="row">
    <ArrowButton px="6px" text={text} onPress={onPress} textInteraction={{ hover: { color: "white" } }} />
  </View>
);
