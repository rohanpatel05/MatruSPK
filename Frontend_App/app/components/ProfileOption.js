import { Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

const ProfileOption = ({ name, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.optionName}>{name}</Text>
      <Ionicons name="chevron-forward" size={25} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    alignItems: "center",
  },
  optionName: {
    fontFamily: "InterMedium",
    fontSize: 20,
  },
});

export default ProfileOption;
