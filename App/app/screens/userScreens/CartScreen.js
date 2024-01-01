import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";
import Spinner from "react-native-loading-spinner-overlay";
import CartItemList from "../../components/CartItemList";
import { useIsFocused } from "@react-navigation/native";
import ChargesList from "../../components/ChargesList";
import {
  EMPTY_CART_HEADER,
  EMPTY_CART_MESSAGE,
} from "../../config/descriptionConfig";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const CartScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyCart, setIsEmptyCart] = useState(false);
  const [cart, setCart] = useState(null);
  const [charges, setCharges] = useState(null);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const isFocused = useIsFocused();

  const getUserCart = async () => {
    let canCalculate = false;
    setIsLoading(true);
    setIsEmptyCart(false);
    await axios
      .get(`${BASE_URL}/cartitems/${userInfo.cart.cart_id}`)
      .then((response) => {
        setCart(response.data);
        setIsEmptyCart(false);
        canCalculate = true;
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setIsEmptyCart(true);
          canCalculate = false;
        }
      })
      .finally(() => setIsLoading(false));

    if (canCalculate) {
      await getChargeAmounts();
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    return await axios
      .delete(`${BASE_URL}/cart/${userInfo.cart.cart_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        setCart(null);
        setIsEmptyCart(true);
      })
      .finally(() => setIsLoading(false));
  };

  const getChargeAmounts = async () => {
    setIsLoading(true);
    return await axios
      .get(`${BASE_URL}/charges/${userInfo.cart.cart_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setCharges(response.data);
      })
      .catch((error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleCheckout = async () => {
    let valid = false;
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/orders/orderAvailable/${userInfo.cart.cart_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        valid = true;
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

    if (valid) {
      navigation.navigate("Checkout", { price: charges[3] });
    }
  };

  const refreshCart = async () => {
    await getUserCart();
  };

  useEffect(() => {
    if (isFocused) {
      refreshCart();
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      setShowMessage(false);
    };
  }, []);

  if (isEmptyCart) {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner visible={isLoading} />

        <TopBar
          displayBackButton={true}
          buttonName={"close"}
          displayCart={false}
          centerText="Bag"
          navigation={navigation}
        />
        <View style={styles.emptyCartBodyWrapper}>
          <Text style={styles.emptyCartHeader}>{EMPTY_CART_HEADER}</Text>
          <Text style={styles.emptyCartDescription}>{EMPTY_CART_MESSAGE}</Text>

          <CustomButton
            background={"dullGreen"}
            disabled={false}
            onPress={() => {
              navigation.navigate("Home");
            }}
          >
            Start shopping
          </CustomButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={true}
        buttonName={"close"}
        displayCart={false}
        centerText="Bag"
        navigation={navigation}
      />
      {showMessage && (
        <View style={styles.popupMessage}>
          <Text style={styles.popupMessageText}>{message}</Text>
        </View>
      )}
      <View style={styles.clearBar}>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>CLEAR</Text>
        </TouchableOpacity>
      </View>
      {cart && (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.cartitem_id}
            renderItem={({ item }) => (
              <CartItemList cartItem={item} refreshCart={refreshCart} />
            )}
          />

          {charges &&
            charges.map((item) => <ChargesList key={item.key} item={item} />)}

          <View style={styles.checkoutButtonWrapper}>
            <TouchableOpacity
              onPress={handleCheckout}
              style={styles.addToCartButton}
            >
              <Text style={styles.addToCartButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clearBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 20,
  },
  clearText: {
    fontFamily: "InterRegular",
    fontSize: 15,
  },
  emptyCartBodyWrapper: {
    marginTop: windowHeight * 0.3,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  emptyCartHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.maroon,
  },
  emptyCartDescription: {
    fontFamily: "InterRegular",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  checkoutButtonWrapper: {
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  addToCartButton: {
    backgroundColor: Colors.maroon,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    alignSelf: "center",
    alignItems: "center",
    width: windowWidth * 0.8,
  },
  addToCartButtonText: {
    fontFamily: "InterSemiBold",
    color: "white",
    fontSize: 20,
  },
  popupMessage: {
    position: "absolute",
    top: windowHeight / 2,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 10,
  },
  popupMessageText: {
    color: "white",
    textAlign: "center",
    fontFamily: "InterRegular",
  },
});

export default CartScreen;
