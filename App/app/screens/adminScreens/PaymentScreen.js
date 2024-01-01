import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";

const PaymentScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState(null);
  const [orderId, setOrderId] = useState("");

  const idRegex = /^[1-9][0-9]{0,10}$/;

  const getAllPayments = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/payments`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setPayments(response.data);
      })
      .catch((error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        setShowMessage(true);
        setMessage(error.message);
        setPayments(null);
      })
      .finally(() => setIsLoading(false));
  };

  const getPaymentsByOrder = async () => {
    const trimmedOrderId = orderId.trim();
    if (trimmedOrderId === "") {
      return;
    }
    if (!idRegex.test(trimmedOrderId)) {
      setShowMessage(true);
      setMessage("Invalid order id value.");
      setPayments(null);
      return;
    }
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/payments/${trimmedOrderId}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setPayments(response.data);
        setOrderId("");
      })
      .catch((error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        setShowMessage(true);
        setMessage(error.message);
        setPayments(null);
      })
      .finally(() => setIsLoading(false));
  };

  const formateDateAndTime = (dateAndTime) => {
    const dateTimeObject = new Date(dateAndTime);
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

    return formattedDateTime;
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
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text style={styles.texts}>Get by order: </Text>
            <TextInput
              style={[styles.texts, styles.input]}
              placeholder="order id"
              value={orderId}
              autoCapitalize="none"
              onChangeText={(text) => {
                setOrderId(text);
              }}
            />
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={getPaymentsByOrder}
            >
              <Text style={[styles.texts, { color: Colors.maroon }]}>Get</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={getAllPayments}
          >
            <Text style={styles.buttonText}>Get all payments</Text>
          </TouchableOpacity>

          {showMessage ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.errorMessage}>{message}</Text>
            </View>
          ) : null}

          {payments &&
            payments.map((item, index) => (
              <View key={index} style={{ rowGap: 1 }}>
                <Text style={styles.resultText}>Order #{item.order_id},</Text>

                <Text style={styles.resultText}>
                  Payment type: {item.payment_method},
                </Text>

                <Text style={styles.resultText}>
                  Amount: Rs. {item.amount},
                </Text>
                <Text style={styles.resultText}>
                  Payment date and time:{"\n"}
                  {formateDateAndTime(item.payment_date_time)}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    rowGap: 30,
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  texts: {
    fontFamily: "InterRegular",
    fontSize: 18,
  },
  input: {
    borderBottomWidth: 1,
    width: 70,
    borderBottomColor: Colors.darkGrey,
  },
  buttonWrapper: {
    width: 200,
    height: 37,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.maroon,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: "InterSemiBold",
    fontSize: 16,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "auto",
  },
  resultText: {
    fontFamily: "InterRegular",
    fontSize: 17,
  },
});

export default PaymentScreen;
