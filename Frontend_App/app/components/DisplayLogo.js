import { Image, View } from "react-native";
import React from "react";
import propTypes from "prop-types";

const logo = require("../images/Logo.png");

export default function DisplayLogo({ width, height }) {
  return (
    <View>
      <Image
        style={{ height: height, width: width, resizeMode: "contain" }}
        source={logo}
      />
    </View>
  );
}

DisplayLogo.propTypes = {
  width: propTypes.number,
  height: propTypes.number,
};
