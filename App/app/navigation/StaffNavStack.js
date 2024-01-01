import React from "react";
import { Dimensions } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import {
  StaffHomeScreen,
  OrderInfoScreen,
  StaffProductScreen,
} from "../screens/staffScreens";
import Colors from "../config/Colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const windowHeight = Dimensions.get("window").height;

const StaffBottomTabNav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: Colors.black,
        tabBarIconStyle: { marginTop: 5 },
        tabBarActiveBackgroundColor: Colors.lightGrey,
        tabBarInactiveBackgroundColor: Colors.backgroundWhite,
        tabBarActiveTintColor: Colors.maroon,
        tabBarLabelStyle: { marginBottom: 8 },
        tabBarHideOnKeyboard: false,
        tabBarStyle: { height: windowHeight / 9.3 },
      }}
    >
      <Tab.Screen
        name="Order"
        component={StaffHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Product"
        component={StaffProductScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reorder-four" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StaffNavStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffBottomTab" component={StaffBottomTabNav} />
      <Stack.Screen name="OrderInfo" component={OrderInfoScreen} />
    </Stack.Navigator>
  );
};

export default StaffNavStack;
