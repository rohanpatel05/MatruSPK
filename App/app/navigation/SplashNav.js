import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Splash } from "../screens";

const Stack = createNativeStackNavigator();

const SplashNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
    </Stack.Navigator>
  );
};

export default SplashNav;
