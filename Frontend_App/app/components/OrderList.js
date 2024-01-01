import { View, Text, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/URL";
import Spinner from "react-native-loading-spinner-overlay";
import { AuthContext } from "../context/AuthContext";
import { OrderStatus } from "../config/orderStatusMap";
import { SPLIT_MARKER } from "../config/descriptionConfig";

const OrderList = ({ orders }) => {
  const { userInfo } = useContext(AuthContext);
  const [address, setAddress] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderItems, setOrderItems] = useState(null);
  const [formattedDateAndTime, setFormattedDateAndTime] = useState("");
  const [status, setStatus] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const getOrderItems = async () => {
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/orderitems/${orders.order_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setOrderItems(response.data);

        const total = response.data.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setTotalItems(total);
      })
      .finally(() => setIsLoading(false));
  };

  const initCleanVariables = () => {
    const dateTimeObject = new Date(orders.order_date_time);
    const formattedDateTime = dateTimeObject.toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "IST",
      hour12: true,
    });

    setFormattedDateAndTime(formattedDateTime);

    setStatus(OrderStatus[orders.status]);

    const addressParts = orders.address.split(SPLIT_MARKER);
    setAddress(addressParts);
  };

  useEffect(() => {
    getOrderItems();
    initCleanVariables();
  }, []);

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />

      <View>
        <Text style={styles.simpleText}>
          {formattedDateAndTime} {"\u2022"}
        </Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.simpleText}>
            Order #{orders.order_id} {"\u2022 "}
          </Text>
          <Text style={styles.simpleText}>
            Rs. {orders.total_amount} {"\u2022 "}
          </Text>
          <Text style={styles.simpleText}>{totalItems} Items</Text>
        </View>
      </View>

      <View>
        {orderItems &&
          orderItems.map((item) => (
            <View style={styles.productsWrapper} key={item.orderitem_id}>
              <Text style={styles.simpleText}>{item.quantity} X </Text>
              <Text style={styles.simpleText}>{item.product.name}</Text>
            </View>
          ))}
      </View>

      <View>
        {address &&
          address.map((item, index) => (
            <Text style={styles.simpleText} key={index}>
              {item}
            </Text>
          ))}
      </View>

      <View>
        <View style={styles.statusWrapper}>
          <Text style={styles.simpleText}>Status: </Text>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
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
  infoWrapper: {
    flexDirection: "row",
  },
  simpleText: {
    fontFamily: "InterRegular",
    fontSize: 17,
  },
  productsWrapper: {
    flexDirection: "row",
  },
  statusWrapper: {
    flexDirection: "row",
  },
  status: {
    fontFamily: "InterSemiBold",
    fontSize: 17,
  },
});
export default OrderList;
