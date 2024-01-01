import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import Topbar from "../../components/TopBar";
import Spinner from "react-native-loading-spinner-overlay";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../config/URL";
import axios from "axios";
import Colors from "../../config/Colors";
import { SPLIT_MARKER } from "../../config/descriptionConfig";
import { useStripe } from "@stripe/stripe-react-native";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const CheckoutScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(AuthContext);
  const { price } = route.params;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [streetAddress2, setStreetAddress2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");

  const zipRegex = /^[0-9]{6}$/;
  const indianStateAbbreviationRegex =
    /^(?:AP|AR|AS|BR|CG|GA|GJ|HR|HP|JH|KA|KL|MP|MH|MN|ML|MZ|NL|OR|PB|RJ|SK|TN|TG|TR|UP|UT|WB)$/;

  const isFormNotEmpty =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    streetAddress.trim() !== "" &&
    city.trim() !== "";

  const isValidZip = zipRegex.test(zip);
  const isValidState = indianStateAbbreviationRegex.test(state);

  const createDeliveryAddressString = () => {
    let deliveryAddress;
    if (streetAddress2.trim() === "") {
      deliveryAddress =
        firstName.trim() +
        " " +
        lastName.trim() +
        SPLIT_MARKER +
        streetAddress.trim() +
        SPLIT_MARKER +
        city.trim() +
        ", " +
        state.trim() +
        " " +
        zip.trim();
    } else {
      deliveryAddress =
        firstName.trim() +
        " " +
        lastName.trim() +
        SPLIT_MARKER +
        streetAddress.trim() +
        SPLIT_MARKER +
        streetAddress2.trim() +
        SPLIT_MARKER +
        city.trim() +
        ", " +
        state.trim() +
        " " +
        zip.trim();
    }
    return deliveryAddress;
  };

  const getUser = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${userInfo.user.email}`,
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      );
      if (response.status === 200) {
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);

        if (response.data.address !== null) {
          const parts = response.data.address.split(SPLIT_MARKER);

          setStreetAddress(parts[0]);
          setStreetAddress2(parts[1]);
          setCity(parts[2]);
          setState(parts[3]);
          setZip(parts[4]);
        }
      }
    } catch (error) {
      if (!error.response) {
        setShowMessage(true);
        setMessage(
          "Network error occurred! Please check your internet connection and try again."
        );
      }
    }
    setIsLoading(false);
  };

  const handlePlaceOrder = async () => {
    const trimmedZip = zip.trim();
    const deliveryAddress = createDeliveryAddressString();
    const userEmail = userInfo.user.email;
    const totalAmount = price.amount;

    const decimalAmount = parseFloat(totalAmount);
    const stripePaymentAmount = decimalAmount * 100;

    setIsLoading(true);
    try {
      // 1. Check if address is deliverable
      const zipValidityResponse = await axios.get(
        `${BASE_URL}/delZip/isValidAddress/${trimmedZip}`
      );

      if (zipValidityResponse.status !== 200) {
        setShowMessage(true);
        setMessage("Something went wrong.");
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // 2. Create payment intent
      const paymentIntentResponse = await axios.post(
        `${BASE_URL}/payments/intents`,
        {
          amount: stripePaymentAmount,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      );

      if (paymentIntentResponse.status !== 201) {
        setShowMessage(true);
        setMessage("Something went wrong.");
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // 3. Initialize the payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: "MatruSPK",
        paymentIntentClientSecret: paymentIntentResponse.data.paymentIntent,
      });

      if (initResponse.error) {
        setShowMessage(true);
        setMessage("Something went wrong.");
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // 4. Present the payment sheet
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        if (paymentResponse.error.code === "Canceled") {
          setIsLoading(false);
          return;
        }
        setShowMessage(true);
        setMessage("Something went wrong.");
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
        setIsLoading(false);
        return;
      }

      // 5. Create order
      const placeOrderResponse = await axios.post(
        `${BASE_URL}/orders`,
        {
          user_email: userEmail,
          total_amount: totalAmount,
          address: deliveryAddress,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      );
      if (placeOrderResponse.status === 201) {
        const orderID = placeOrderResponse.data.order_id;

        navigation.navigate("SuccessfulOrder", { orderId: orderID });
      }
    } catch (error) {
      if (error.response) {
        const responseError =
          error.response.data.message || "Unknown error occurred.";

        setShowMessage(true);
        setMessage(responseError);
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
      } else {
        setShowMessage(true);
        setMessage(
          "Network error occurred! Please check your internet connection and try again."
        );
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUser();

    return () => {
      setShowMessage(false);
    };
  }, []);

  useEffect(() => {
    setCanSubmit(isFormNotEmpty && isValidZip && isValidState);
  }, [firstName, lastName, streetAddress, streetAddress2, city, state, zip]);

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />

      <Topbar
        displayBackButton={true}
        buttonName={"chevron-back"}
        displayCart={false}
        centerText="Checkout"
        navigation={navigation}
      />

      {showMessage && (
        <View style={styles.popupMessage}>
          <Text style={styles.popupMessageText}>{message}</Text>
        </View>
      )}

      <ScrollView>
        <View style={styles.wrapper}>
          <View style={{ rowGap: 10 }}>
            <Text style={styles.header}>Delivery Address</Text>
            <Text style={styles.description}>
              Please provide a delivery address for the order.
            </Text>
          </View>

          <View style={styles.nameInputWrapper}>
            <View
              style={[
                styles.inputComponentsWrapper,
                { width: windowWidth / 2.5 },
              ]}
            >
              <Text style={styles.inputTitle}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="First"
                value={firstName}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setFirstName(text);
                }}
              />
            </View>

            <View
              style={[
                styles.inputComponentsWrapper,
                { width: windowWidth / 2.5 },
              ]}
            >
              <Text style={styles.inputTitle}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last"
                value={lastName}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setLastName(text);
                }}
              />
            </View>
          </View>

          <View style={styles.inputComponentsWrapper}>
            <Text style={styles.inputTitle}>Street address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main Street"
              value={streetAddress}
              autoCapitalize="none"
              onChangeText={(text) => {
                setStreetAddress(text);
              }}
            />
          </View>

          <View style={styles.inputComponentsWrapper}>
            <Text style={styles.inputTitle}>Street address 2 (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartment number or Street"
              value={streetAddress2}
              autoCapitalize="none"
              onChangeText={(text) => {
                setStreetAddress2(text);
              }}
            />
          </View>

          <View style={styles.inputComponentsWrapper}>
            <Text style={styles.inputTitle}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Surat"
              value={city}
              autoCapitalize="none"
              onChangeText={(text) => {
                setCity(text);
              }}
            />
          </View>

          <View style={styles.nameInputWrapper}>
            <View
              style={[
                styles.inputComponentsWrapper,
                { width: windowWidth / 2.5 },
              ]}
            >
              <Text style={styles.inputTitle}>Zip</Text>
              <TextInput
                style={styles.input}
                placeholder="_ _ _ _ _ _"
                value={zip}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setZip(text);
                }}
              />
            </View>

            <View
              style={[
                styles.inputComponentsWrapper,
                { width: windowWidth / 2.5 },
              ]}
            >
              <Text style={styles.inputTitle}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="GJ"
                value={state}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setState(text);
                }}
              />
              <Text style={{ color: Colors.darkGrey, marginLeft: 10 }}>
                state abbreviation
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutButtonWrapper}>
        <TouchableOpacity
          style={
            canSubmit ? styles.addToCartButton : styles.disabledAddToCartButton
          }
          disabled={!canSubmit}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.addToCartButtonText}>Continue</Text>
        </TouchableOpacity>
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
  header: {
    fontFamily: "InterBold",
    fontSize: 26,
    color: Colors.dullGreen,
  },
  description: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
    textAlign: "auto",
  },
  checkoutButtonWrapper: {
    justifyContent: "flex-end",
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.grey,
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
  disabledAddToCartButton: {
    backgroundColor: Colors.grey,
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
    fontFamily: "InterRegular",
    fontSize: 19,
    textAlign: "center",
  },
  nameInputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputComponentsWrapper: {
    rowGap: 7,
  },
  inputTitle: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.darkGrey,
    marginLeft: 9,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
    padding: 10,
    borderRadius: 12,
    fontFamily: "InterRegular",
    fontSize: 20,
    padding: 10,
  },
});

export default CheckoutScreen;
