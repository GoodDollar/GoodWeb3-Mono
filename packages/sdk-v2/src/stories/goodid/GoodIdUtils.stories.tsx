import React, { useEffect } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Text, View } from "react-native";

import { useLocation } from "../../sdk/goodid";

const LocationView = () => {
  const { locationState } = useLocation();

  useEffect(() => {
    if (locationState.error) {
      // throw error modal (to be added)
    }
  }, [locationState]);

  return (
    <View>
      <Text> {`Your location is: ${locationState.location}`} </Text>
    </View>
  );
};

const Page = (params: object) => <LocationView {...params} />;

export default {
  title: "GoodId/Location Utils",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const LocationUtils = Template.bind({});
