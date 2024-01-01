import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Colors from "../config/Colors";
import propTypes from "prop-types";

export default function CustomButton({
  children,
  background,
  disabled,
  onPress,
}) {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.wrapper,
          {
            backgroundColor: Colors[background],
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 55,
    width: 200,
  },
  buttonText: {
    fontFamily: "LexendSemiBold",
    fontSize: 20,
    color: Colors.white,
  },
});

CustomButton.propTypes = {
  children: propTypes.string,
  background: propTypes.string,
  disabled: propTypes.bool,
  onPress: propTypes.func,
};
