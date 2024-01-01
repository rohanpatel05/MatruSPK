import React from "react";
import { ActivityIndicator, View } from "react-native";
import Colors from "../config/Colors";

const Splash = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: Colors.grey,
      }}
    >
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
};

export default Splash;
