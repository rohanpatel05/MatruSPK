import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState, useEffect } from "react";
import TopBar from "../../components/TopBar";
import {
  APP_TITLE,
  NETWORK_ERROR_HEADER,
  NETWORK_ERROR_MESSAGE,
} from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;

const EditProfileScreen = ({ navigation }) => {
  const { userInfo, setUserInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const isFormChanged =
    newFirstName.trim() !== firstName.trim() ||
    newLastName.trim() !== lastName.trim() ||
    newPhoneNumber.trim() !== phoneNumber.trim();

  const isFormNotEmpty =
    newFirstName.trim() !== "" &&
    newLastName.trim() !== "" &&
    newPhoneNumber.trim() !== "";

  const getUserInfo = async () => {
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/users/${userInfo.user.email}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setPhoneNumber(response.data.phone_number);
        setNewFirstName(response.data.first_name);
        setNewLastName(response.data.last_name);
        setNewPhoneNumber(response.data.phone_number);
      })
      .catch((error) => {
        setIsError(true);
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          setErrorMessage(responseError);
        } else {
          error.message = "Network error occurred!";
          setIsNetworkError(true);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const updateUserInfo = async () => {
    const updatedFirstName = newFirstName.trim();
    const updatedLastName = newLastName.trim();
    const updatedPhoneNumber = newPhoneNumber.trim();
    setIsUpdateSuccessful(false);
    setIsLoading(true);

    await axios
      .put(
        `${BASE_URL}/users/updateUI/${userInfo.user.email}`,
        {
          first_name: updatedFirstName,
          last_name: updatedLastName,
          phone_number: updatedPhoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setIsUpdateSuccessful(true);
        let updatedUserInfo = {
          ...userInfo,
          user: {
            ...userInfo.user,
            first_name: updatedFirstName,
            last_name: updatedLastName,
          },
        };
        setUserInfo(updatedUserInfo);
        AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        setFirstName(updatedFirstName);
        setLastName(updatedLastName);
        setPhoneNumber(updatedPhoneNumber);
        setNewFirstName(updatedFirstName);
        setNewLastName(updatedLastName);
        setNewPhoneNumber(updatedPhoneNumber);
      })
      .catch((error) => {
        if (error.response) {
          setIsError(true);
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          setErrorMessage(responseError);
        } else {
          setIsNetworkError(true);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    setCanSubmit(isFormChanged && isFormNotEmpty);
  }, [
    newFirstName,
    newLastName,
    newPhoneNumber,
    firstName,
    lastName,
    phoneNumber,
  ]);

  if (isNetworkError) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar
          displayBackButton={true}
          buttonName={"chevron-back"}
          displayCart={false}
          centerText={APP_TITLE}
          navigation={navigation}
        />
        <Spinner visible={isLoading} />

        <View style={styles.errorMessageWrapper}>
          <Text style={styles.errorHeader}>{NETWORK_ERROR_HEADER}</Text>
          <Text style={styles.errorMessage}>{NETWORK_ERROR_MESSAGE}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        displayBackButton={true}
        buttonName={"chevron-back"}
        displayCart={false}
        centerText={APP_TITLE}
        navigation={navigation}
      />
      <Spinner visible={isLoading} />

      <View style={styles.formWrapper}>
        <Text style={styles.header}>Update Profile</Text>

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
              value={newFirstName}
              autoCapitalize="none"
              onChangeText={(text) => {
                setNewFirstName(text);
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
              value={newLastName}
              autoCapitalize="none"
              onChangeText={(text) => {
                setNewLastName(text);
              }}
            />
          </View>
        </View>

        <View style={styles.inputComponentsWrapper}>
          <Text style={styles.inputTitle}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="0123456789"
            value={newPhoneNumber}
            autoCapitalize="none"
            onChangeText={(text) => {
              setNewPhoneNumber(text);
            }}
          />
        </View>

        <View style={{ alignItems: "center", rowGap: 20 }}>
          {canSubmit ? (
            <CustomButton
              background="maroon"
              onPress={() => {
                updateUserInfo();
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
                Profile updated successfully!
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
  nameInputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formWrapper: {
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
  errorMessageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  errorHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.maroon,
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

export default EditProfileScreen;
