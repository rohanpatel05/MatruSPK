import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../config/URL";
import axios from "axios";
import Orders from "../../components/Orders";

const StaffHomeScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [orders, setOrders] = useState(null);

  const statusRegex = /^[0-2]{1}/;

  const getOrderByStatus = async () => {
    setShowMessage(false);
    setMessage("");
    setOrders(null);
    const trimmedStatus = status.trim();
    if (!statusRegex.test(trimmedStatus)) {
      setShowMessage(true);
      setMessage("Please enter a valid value 0 or 1 or 2.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/orders/byStatus/${trimmedStatus}`,
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      );
      if (response.status === 200) {
        setOrders(response.data);
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
        displayBackButton={false}
        centerText={APP_TITLE}
        displayLogout={true}
      />
      <View style={styles.wrapper}>
        <Text style={styles.header}>Orders</Text>
        <Text style={styles.message}>
          Get orders by the status. Options: 0=Ordered, 1=On the way,
          2=Delivered
        </Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.message}>Status: </Text>
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
            onPress={getOrderByStatus}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {showMessage ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.errorMessage}>{message}</Text>
          </View>
        ) : null}

        {orders && (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id}
            renderItem={({ item }) => (
              <Orders order={item} navigation={navigation} />
            )}
          />
        )}
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
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  header: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.black,
    textAlign: "auto",
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
    width: 70,
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
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "center",
    marginBottom: 30,
  },
});

export default StaffHomeScreen;
