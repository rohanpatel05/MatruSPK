import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Colors from "../config/Colors";

const ChargesList = ({ item }) => {
  return (
    <View style={item.key === 0 ? styles.bottomWrapper : null}>
      {item.key !== 3 ? (
        <View style={styles.container}>
          <Text style={styles.individualCharges}>{item.name}</Text>
          <Text style={styles.individualCharges}>Rs. {item.amount}</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.totalCharge}>{item.name}</Text>
          <Text style={styles.totalCharge}>Rs. {item.amount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 2,
  },
  individualCharges: {
    fontFamily: "InterRegular",
    fontSize: 16,
  },
  totalCharge: {
    fontFamily: "InterBold",
    fontSize: 16,
  },
  bottomWrapper: {
    borderTopWidth: 1,
    borderTopColor: Colors.grey,
  },
});

export default ChargesList;
