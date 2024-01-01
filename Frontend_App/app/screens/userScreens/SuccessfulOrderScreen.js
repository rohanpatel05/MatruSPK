import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import Colors from "../../config/Colors";
import { CommonActions } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const SuccessfulOrderScreen = ({ navigation, route }) => {
  const { orderId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topTabFirstRow}>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: "Home",
              })
            );
          }}
        >
          <Ionicons name="close" size={35} />
        </TouchableOpacity>
      </View>

      <View style={styles.wrapper}>
        <Text style={styles.heading}>
          Congratulations! Your order has been successfully placed. 🎉
        </Text>
        <Text style={styles.orderInfo}>
          Order Number: {orderId}
          {"\n"}Estimated Delivery Time: 3-5 Days
        </Text>
        <Text style={styles.message}>
          Thank you for choosing MatruSPK. You can track the status of your
          order at any time through our app. We will provide regular updates on
          the progress of your order, so you can stay informed about its
          delivery.
          {"\n\n"}Happy Shopping!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    padding: 30,
    rowGap: 30,
  },
  heading: {
    fontFamily: "InterBold",
    fontSize: 26,
    color: Colors.dullGreen,
  },
  orderInfo: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
    textAlign: "auto",
  },
  message: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
    textAlign: "auto",
  },
  topTabFirstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default SuccessfulOrderScreen;
