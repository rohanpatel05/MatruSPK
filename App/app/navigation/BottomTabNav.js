import { Dimensions } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../config/Colors.js";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import {
  HomeScreen,
  OrdersScreen,
  ProfileScreen,
  SearchScreen,
} from "../screens/userScreens";

const Tab = createBottomTabNavigator();

const windowHeight = Dimensions.get("window").height;

const BottomTabNav = () => {
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
        name="Home"
        component={HomeScreen}
        options={({ route }) => ({
          tabBarStyle: {
            height: windowHeight / 9.3,
            display: getTabBarVisibility(route),
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-sharp" color={color} size={30} />
          ),
        })}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={({ route }) => ({
          tabBarStyle: {
            height: windowHeight / 9.3,
            display: getTabBarVisibility(route),
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={30} />
          ),
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={({ route }) => ({
          tabBarStyle: {
            height: windowHeight / 9.3,
            display: getTabBarVisibility(route),
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" color={color} size={30} />
          ),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Feed";

  if (routeName === "Cart" || routeName === "ProductDetail") {
    return "none";
  } else {
    return "flex";
  }
};

export default BottomTabNav;
