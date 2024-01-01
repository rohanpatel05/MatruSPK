import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

const Orders = ({ order, navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("OrderInfo", { order: order })}
      >
        <View style={{ rowGap: 2 }}>
          <Text style={styles.simpleText}>Order #{order.order_id}</Text>
          <Text style={styles.simpleText}>User: {order.user_email}</Text>
          <Text style={styles.simpleText}>Price: Rs. {order.total_amount}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderBottomWidth: 0.25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    rowGap: 15,
  },
  simpleText: {
    fontFamily: "InterRegular",
    fontSize: 16,
  },
});
export default Orders;
