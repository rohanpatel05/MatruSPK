import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState, useEffect } from "react";
import TopBar from "../../components/TopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";
import Spinner from "react-native-loading-spinner-overlay";
import Ionicons from "react-native-vector-icons/Ionicons";

const windowWidth = Dimensions.get("window").width;

const ChangePasswordScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showUpdatedPassword, setShowUpdatedPassword] = useState(false);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

  const isFormNotEmpty =
    passwordRegex.test(oldPassword.trim()) &&
    passwordRegex.test(updatedPassword.trim());

  const isFormNotSame = updatedPassword.trim() !== oldPassword.trim();

  const updatePassword = async () => {
    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = updatedPassword.trim();
    setIsUpdateSuccessful(false);
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/users/updatePass/${userInfo.user.email}`,
        { oldPassword: trimmedOldPassword, password: trimmedNewPassword },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setIsUpdateSuccessful(true);
        setOldPassword("");
        setUpdatedPassword("");
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

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleUpdatedPasswordVisibility = () => {
    setShowUpdatedPassword(!showUpdatedPassword);
  };

  useEffect(() => {
    setCanSubmit(isFormNotEmpty && isFormNotSame);
  }, [updatedPassword, oldPassword]);

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

      <View style={styles.wrapper}>
        <Text style={styles.header}>Update Password</Text>

        <View style={styles.inputComponentsWrapper}>
          <Text style={styles.inputTitle}>Current password</Text>
          <View style={styles.passWrapper}>
            <TextInput
              style={[styles.input, { width: "90%" }]}
              placeholder="enter current password"
              value={oldPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showOldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
              }}
            />
            <TouchableOpacity onPress={toggleOldPasswordVisibility}>
              <Ionicons
                name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                size={25}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputComponentsWrapper}>
          <Text style={styles.inputTitle}>New password</Text>
          <View style={styles.passWrapper}>
            <TextInput
              style={[styles.input, { width: "90%" }]}
              placeholder="enter a strong password"
              value={updatedPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showUpdatedPassword}
              onChangeText={(text) => {
                setUpdatedPassword(text);
              }}
            />
            <TouchableOpacity onPress={toggleUpdatedPasswordVisibility}>
              <Ionicons
                name={showUpdatedPassword ? "eye-off-outline" : "eye-outline"}
                size={25}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: "center", rowGap: 20 }}>
          {canSubmit ? (
            <CustomButton
              background="maroon"
              onPress={() => {
                updatePassword();
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
                Password updated successfully!
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
  passWrapper: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
    borderRadius: 12,
    width: windowWidth / 1.175,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
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
    textAlign: "auto",
    marginBottom: 30,
  },
});

export default ChangePasswordScreen;
