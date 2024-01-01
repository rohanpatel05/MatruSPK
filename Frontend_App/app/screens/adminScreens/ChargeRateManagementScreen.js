import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";

const ChargeRateManagementScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState(null);
  const [rate1, setRate1] = useState("");
  const [rate2, setRate2] = useState("");

  const numRegex = /^[0-9]+$/;

  const getChargeRates = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/charges`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setAdditionalCharges(response.data);
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
        setAdditionalCharges(null);
      })
      .finally(() => setIsLoading(false));
  };

  const updateRates = async (name, updatedRate) => {
    const numberedRate = Number(updatedRate);
    if (!numRegex.test(numberedRate)) {
      return;
    }

    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/charges/${name}`,
        {
          rate: numberedRate,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setRate1("");
        setRate2("");
        refreshRates();
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
      })
      .finally(() => setIsLoading(false));
  };

  const refreshRates = async () => {
    await getChargeRates();
  };

  useEffect(() => {
    refreshRates();
  }, []);

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

      <View style={styles.wrapper}>
        <Text style={styles.header}>Additional Charges</Text>

        {additionalCharges &&
          additionalCharges.map((item, index) => (
            <View style={styles.chargeWrapper} key={index}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.texts}>{item.name}: </Text>
                <Text style={styles.texts}>
                  {item.name === "Delivery"
                    ? "Rs. " + item.rate
                    : item.rate + "%"}
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.texts]}
                value={item.name === "Delivery" ? rate1 : rate2}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="new rate"
                onChangeText={(text) => {
                  item.name === "Delivery" ? setRate1(text) : setRate2(text);
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  item.name === "Delivery"
                    ? updateRates(item.name, rate1)
                    : updateRates(item.name, rate2);
                }}
                disabled={
                  item.name === "Delivery"
                    ? rate1.trim() === "" || rate1 === String(item.rate)
                    : rate2.trim() === "" || rate2 === String(item.rate)
                }
              >
                <Text style={[styles.texts, { color: Colors.maroon }]}>
                  update
                </Text>
              </TouchableOpacity>
            </View>
          ))}

        {showMessage ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.errorMessage}>{message}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "auto",
  },
  wrapper: {
    padding: 30,
    rowGap: 30,
  },
  header: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.black,
  },
  texts: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
  },
  chargeWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
    width: 77,
  },
});

export default ChargeRateManagementScreen;
