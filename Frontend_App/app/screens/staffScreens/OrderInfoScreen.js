import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import OrderList from "../../components/OrderList";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import { BASE_URL } from "../../config/URL";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const OrderInfoScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(AuthContext);
  const { order } = route.params;

  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);

  const statusRegex = /^[0-2]{1}/;

  const updateOrderStatus = async () => {
    setShowMessage(false);
    setMessage("");
    setIsUpdateSuccessful(false);
    const trimmedStatus = status.trim();
    if (!statusRegex.test(trimmedStatus)) {
      setShowMessage(true);
      setMessage("Please enter a valid value 0 or 1 or 2.");
      return;
    }
    const orderId = order.order_id;
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/orders/updateStatus/${orderId}`,
        {
          status: trimmedStatus,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      );
      if (response.status === 200) {
        setIsUpdateSuccessful(true);
      }
    } catch (error) {
      if (error.response) {
        const responseError =
          error.response.data.message || "Unknown error occurred.";
        error.message = responseError;
      } else {
        error.message = "Network error occured!";
      }
      setMessage(error.message);
      setShowMessage(true);
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />
      <StaffTopBar
        displayBackButton={true}
        backButtonName="chevron-back"
        centerText={APP_TITLE}
        displayLogout={false}
        navigation={navigation}
      />
      <Text style={styles.screenHeader}>Order #{order.order_id}</Text>

      <View style={styles.formWrapper}>
        <View style={styles.inputWrapper}>
          <Text style={styles.message}>Update status: </Text>
          <TextInput
            style={styles.input}
            value={status}
            onChangeText={(text) => {
              setStatus(text);
            }}
          />
          <TouchableOpacity
            style={
              status.trim() === ""
                ? styles.disabledButtonWrapper
                : styles.buttonWrapper
            }
            disabled={status.trim() === ""}
            onPress={updateOrderStatus}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {isUpdateSuccessful ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.successMessage}>
              Status updated successfully!
            </Text>
          </View>
        ) : showMessage ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.errorMessage}>{message}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView>
        <OrderList orders={order} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 21,
    padding: 20,
  },
  formWrapper: {
    rowGap: 20,
    marginTop: 5,
    borderBottomWidth: 0.25,
    paddingBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  message: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
    textAlign: "auto",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: 50,
    marginLeft: 10,
    fontFamily: "InterRegular",
    fontSize: 18,
  },
  disabledButtonWrapper: {
    marginLeft: 20,
    backgroundColor: Colors.grey,
    width: 100,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWrapper: {
    marginLeft: 20,
    backgroundColor: Colors.maroon,
    width: 100,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontFamily: "InterSemiBold",
    fontSize: 18,
  },
  successMessage: {
    color: Colors.dullGreen,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "center",
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "center",
  },
});

export default OrderInfoScreen;
