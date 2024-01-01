import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import TopBar from "../../components/TopBar";
import {
  APP_TITLE,
  DELIVERY_VALIDATION_CHECK_MESSAGE,
} from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";
import Spinner from "react-native-loading-spinner-overlay";

const DeliveryValidatorScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidZip, setIsValidZip] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [zipcode, setZipcode] = useState("");

  const zipRegex = /^[0-9]{6}$/;

  const isFormValueValid = zipcode && zipcode.trim() !== "";

  const deliveryCheck = async () => {
    setIsValidZip(false);
    setIsError(false);
    setErrorMessage("");
    const trimmedZipcode = zipcode.trim();
    if (!zipRegex.test(zipcode.trim())) {
      setIsError(true);
      setErrorMessage("Invalid zip code! Please enter a valid zip code.");
      return;
    }
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/delZip/isValidAddress/${trimmedZipcode}`)
      .then(() => {
        setIsValidZip(true);
        setZipcode("");
      })
      .catch((error) => {
        setIsError(true);
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        setErrorMessage(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setCanSubmit(isFormValueValid);
  }, [zipcode]);

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={true}
        buttonName={"chevron-back"}
        displayCart={false}
        centerText={APP_TITLE}
        navigation={navigation}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.wrapper}>
            <Text style={styles.heading}>
              Check Delivery Availability in Your Area
            </Text>

            <Text style={styles.message}>
              {DELIVERY_VALIDATION_CHECK_MESSAGE}
            </Text>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>Zip code</Text>
              <TextInput
                style={styles.input}
                placeholder="_ _ _ _ _ _"
                value={zipcode}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setZipcode(text);
                }}
              />
            </View>

            <View style={{ alignItems: "center", rowGap: 20 }}>
              {canSubmit ? (
                <CustomButton
                  background="maroon"
                  onPress={() => {
                    deliveryCheck();
                  }}
                >
                  Check
                </CustomButton>
              ) : (
                <CustomButton disabled={true} background="grey">
                  Check
                </CustomButton>
              )}
              {isValidZip ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.successMessage}>
                    We deliver in this area.
                  </Text>
                </View>
              ) : isError ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.dullGreen,
    textAlign: "auto",
  },
  message: {
    fontFamily: "InterRegular",
    fontSize: 17,
    color: Colors.black,
    textAlign: "auto",
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
  successMessage: {
    color: Colors.dullGreen,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "center",
    marginBottom: 30,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "center",
    marginBottom: 30,
  },
});

export default DeliveryValidatorScreen;
