import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import CustomButton from "../../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdateEmailScreen = ({ navigation }) => {
  const { userInfo, setUserInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
  const [updatedEmailAddress, setUpdatedEmailAddress] = useState("");

  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

  const isFormNotSame =
    updatedEmailAddress.trim() !== userInfo.user.email.trim();

  const isFormNotEmpty = emailRegex.test(
    updatedEmailAddress.trim().toLowerCase()
  );

  const updateUserEmail = async () => {
    const updatedEmail = updatedEmailAddress.trim().toLowerCase();
    setIsUpdateSuccessful(false);
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/users/updateEmail/${userInfo.user.email}`,
        { email: updatedEmail },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setIsUpdateSuccessful(true);
        let updatedUserInfo = {
          ...userInfo,
          user: { ...userInfo.user, email: updatedEmail },
          cart: { ...userInfo.cart, user_email: updatedEmail },
        };
        setUserInfo(updatedUserInfo);
        AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUpdatedEmailAddress("");
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
    setCanSubmit(isFormNotEmpty && isFormNotSame);

    if (!isFormNotSame) {
      setIsError(true);
      setErrorMessage(
        "Please enter an email address different from current email."
      );
    }
  }, [updatedEmailAddress]);

  return (
    <SafeAreaView>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={true}
        buttonName={"chevron-back"}
        displayCart={false}
        centerText={APP_TITLE}
        navigation={navigation}
      />

      <View style={styles.wrapper}>
        <Text style={styles.header}>Update Email Address</Text>

        <View style={styles.inputComponentsWrapper}>
          <Text style={styles.inputTitle}>New email address</Text>
          <TextInput
            style={styles.input}
            placeholder="email address"
            value={updatedEmailAddress}
            autoCapitalize="none"
            onChangeText={(text) => {
              setUpdatedEmailAddress(text);
            }}
          />
        </View>

        <View style={{ alignItems: "center", rowGap: 20 }}>
          {canSubmit ? (
            <CustomButton
              background="maroon"
              onPress={() => {
                updateUserEmail();
              }}
            >
              Save
            </CustomButton>
          ) : (
            <CustomButton disabled={true} background="grey">
              Save
            </CustomButton>
          )}
          {isUpdateSuccessful ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.successMessage}>
                Email address updated successfully!
              </Text>
            </View>
          ) : isError ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>
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

export default UpdateEmailScreen;
