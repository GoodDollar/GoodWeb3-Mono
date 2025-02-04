import React, { useEffect } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Text, View } from "react-native";

import { useGeoLocation } from "../../sdk/goodid";

const LocationView = () => {
  const [geoLocation, error] = useGeoLocation();

  useEffect(() => {
    if (error) {
      // throw error modal (to be added)
    }
  }, [/*used*/ geoLocation]);

  return (
    <View>
      <Text> {`Your location is: ${geoLocation?.location}`} </Text>
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
