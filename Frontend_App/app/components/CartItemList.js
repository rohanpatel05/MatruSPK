import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import Spinner from "react-native-loading-spinner-overlay";
import axios from "axios";
import { BASE_URL } from "../config/URL";

const CartItemList = ({ cartItem, refreshCart }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const incrementItemQty = async () => {
    setIsLoading(true);
    return await axios
      .put(`${BASE_URL}/cartitems/increment/${cartItem.cartitem_id}`, null, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        refreshCart();
      })
      .catch((error) => {
        if (error.response?.status === 405) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          setShowMessage(true);
          setMessage(responseError);
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);
          refreshCart();
        }
      })
      .finally(() => setIsLoading(false));
  };

  const decrementItemQty = async () => {
    setIsLoading(true);
    return await axios
      .put(`${BASE_URL}/cartitems/decrement/${cartItem.cartitem_id}`, null, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        refreshCart();
        refreshCart();
      })
      .catch((error) => {
        if (error.response?.status === 405) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          setShowMessage(true);
          setMessage(responseError);
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);
          refreshCart();
        }
      })
      .finally(() => setIsLoading(false));
  };

  const removeItemQty = async () => {
    setIsLoading(true);
    return await axios
      .delete(`${BASE_URL}/cartitems/${cartItem.cartitem_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        refreshCart();
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    return () => {
      setShowMessage(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <View style={styles.wrapper}>
        <Image
          source={{ uri: cartItem.product.image_url }}
          style={styles.productImage}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{cartItem.product.name}</Text>
          <Text style={styles.productPrice}>Rs. {cartItem.product.price}</Text>

          <View style={styles.editQuantity}>
            <TouchableOpacity
              onPress={decrementItemQty}
              style={{ marginRight: 10 }}
            >
              <Feather name="minus-circle" size={25} />
            </TouchableOpacity>

            <Text style={styles.productQuantity}>{cartItem.quantity}</Text>

            <TouchableOpacity onPress={incrementItemQty}>
              <Feather name="plus-circle" size={25} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.trashButtonWrapper}>
        <TouchableOpacity onPress={removeItemQty}>
          <Ionicons name="trash-outline" size={25} />
        </TouchableOpacity>
      </View>

      {showMessage && (
        <View style={styles.popupMessage}>
          <Text style={styles.popupMessageText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignContent: "center",
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 12.5,
    paddingBottom: 12.5,
    flexDirection: "row",
  },
  productImage: {
    height: 75,
    width: 75,
  },
  productInfo: {
    marginLeft: 15,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "InterSemiBold",
    fontSize: 18,
  },
  productPrice: {
    fontFamily: "InterRegular",
    fontSize: 14,
  },
  productQuantity: {
    marginRight: 10,
    fontFamily: "InterRegular",
    fontSize: 18,
  },
  editQuantity: {
    flexDirection: "row",
  },
  trashButtonWrapper: {
    alignSelf: "center",
    justifyContent: "flex-end",
    paddingRight: 25,
  },
  popupMessage: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 10,
  },
  popupMessageText: {
    color: "white",
    textAlign: "center",
  },
});

export default CartItemList;
