import { Text, View, TouchableOpacity } from "react-native";
import React from "react";
import propTypes from "prop-types";
import Colors from "../config/Colors";

export default function TouchableText({
  children,
  alignSelf,
  fontFamily,
  fontSize,
  onPress,
  fontColor,
  textDecor,
}) {
  return (
    <View style={{ alignSelf: alignSelf }}>
      <TouchableOpacity onPress={onPress}>
        <Text
          style={{
            fontFamily: fontFamily,
            fontSize: fontSize,
            color: Colors[fontColor],
            textDecorationLine: textDecor,
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

TouchableText.propTypes = {
  children: propTypes.string,
  alignSelf: propTypes.string,
  fontFamily: propTypes.string,
  fontSize: propTypes.number,
  onPress: propTypes.func,
  textColor: propTypes.string,
  textDecor: propTypes.string,
};
