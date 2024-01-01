import { Text } from "react-native";
import React from "react";
import Colors from "../config/Colors.js";
import propTypes from "prop-types";

function CustomText({ children, color, fontFamily, fontSize, textAlign }) {
  return (
    <Text
      style={[
        {
          color: Colors[color],
          fontFamily: fontFamily,
          fontSize: fontSize,
          textAlign: textAlign,
        },
      ]}
    >
      {children}
    </Text>
  );
}

CustomText.propTypes = {
  children: propTypes.string,
  color: propTypes.string,
  fontFamily: propTypes.string,
  fontSize: propTypes.number,
  textAlign: propTypes.string,
};

export default CustomText;
