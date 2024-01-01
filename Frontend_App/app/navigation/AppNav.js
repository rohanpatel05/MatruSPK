import React, { useCallback, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import CustomFonts from "../config/CustomFonts";
import MyTheme from "../config/MyTheme";

import AuthNavStack from "./AuthNavStack.js";
import UserNavStack from "./UserNavStack.js";
import AdminNavStack from "./AdminNavStack.js";
import StaffNavStack from "./StaffNavStack.js";
import SplashNav from "./SplashNav.js";
import { AuthContext } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

const AppNav = () => {
  const { splashLoading, isAdminLoggedIn, isStaffLoggedIn, isUserLoggedIn } =
    useContext(AuthContext);

  const [isFontLoaded] = useFonts(CustomFonts);

  const onLayoutRootView = useCallback(async () => {
    if (isFontLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [isFontLoaded]);

  if (!isFontLoaded) {
    return null;
  }

  return (
    <NavigationContainer theme={MyTheme} onReady={onLayoutRootView}>
      {splashLoading ? (
        <SplashNav />
      ) : isAdminLoggedIn ? (
        <AdminNavStack />
      ) : isStaffLoggedIn ? (
        <StaffNavStack />
      ) : isUserLoggedIn ? (
        <UserNavStack />
      ) : (
        <AuthNavStack />
      )}
    </NavigationContainer>
  );
};

export default AppNav;
