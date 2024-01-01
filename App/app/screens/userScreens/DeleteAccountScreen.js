import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";
import {
  APP_TITLE,
  DELETE_WARNING_MESSAGE,
} from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import TopBar from "../../components/TopBar";

const DeleteAccountScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const deleteUser = async () => {
    setIsLoading(true);
    await axios
      .delete(`${BASE_URL}/users/${userInfo.user.email}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        logout();
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

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={true}
        buttonName={"close"}
        displayCart={false}
        centerText={APP_TITLE}
        navigation={navigation}
      />

      <View style={styles.contentWrapper}>
        <Text style={styles.heading}>Delete Your Account</Text>
        <Text style={styles.message}>{DELETE_WARNING_MESSAGE}</Text>

        <View style={{ marginTop: 80, rowGap: 20 }}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => {
              deleteUser();
            }}
          >
            <Text style={styles.buttonText}>Yes, delete my account</Text>
          </TouchableOpacity>

          {isError ? (
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
  contentWrapper: {
    padding: 30,
    rowGap: 30,
  },
  heading: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.maroon,
    textAlign: "auto",
  },
  message: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.black,
    textAlign: "auto",
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 12,
    fontFamily: "LexendRegular",
    marginBottom: 10,
  },
  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 55,
    width: 250,
    backgroundColor: Colors.maroon,
  },
  buttonText: {
    fontFamily: "LexendSemiBold",
    fontSize: 18,
    color: Colors.white,
  },
});

export default DeleteAccountScreen;
