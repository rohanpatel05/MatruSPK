import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomText from "../components/CustomText.js";
import DisplayLogo from "../components/DisplayLogo.js";
import Colors from "../config/Colors.js";
import TouchableText from "../components/TouchableText.js";
import CustomButton from "../components/CustomButton.js";
import { AuthContext } from "../context/AuthContext.js";
import { SafeAreaView } from "react-native-safe-area-context";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, register, signUpErrorExist, signUpErrorMessage } =
    useContext(AuthContext);

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const handleFirstNameChange = (text) => {
    setFirstName(text);
  };

  const handleLastNameChange = (text) => {
    setLastName(text);
  };

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (
      !firstName ||
      firstName.trim() === "" ||
      !lastName ||
      lastName.trim() === "" ||
      !phoneNumber ||
      phoneNumber.trim() === "" ||
      !email ||
      email.trim() === "" ||
      !password ||
      password.trim() === ""
    ) {
      setCanSubmit(false);
    } else {
      setCanSubmit(true);
    }
  }),
    [email, password];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.warpper}
    >
      <ScrollView
        contentContainerStyle={styles.scrollableContent}
        keyboardShouldPersistTaps="handled"
      >
        <Spinner visible={isLoading} />
        <SafeAreaView>
          <DisplayLogo height={windowHeight / 3.5} width={windowWidth} />
          <View>
            <CustomText
              fontFamily="LibreBaskervilleBold"
              fontSize={28}
              textAlign="center"
              color="black"
            >
              Register New Account
            </CustomText>
          </View>
          <View style={styles.formWrapper}>
            <View style={{ rowGap: 25, alignItems: "center" }}>
              <View style={styles.nameInputWrap}>
                <View style={styles.nameInputcontainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="first name"
                    value={firstName}
                    onChangeText={(text) => handleFirstNameChange(text)}
                  />
                </View>
                <View style={styles.nameInputcontainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="last name"
                    value={lastName}
                    onChangeText={(text) => handleLastNameChange(text)}
                  />
                </View>
              </View>
              <View style={styles.formInput}>
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="phone number"
                  value={phoneNumber}
                  onChangeText={(text) => handlePhoneNumberChange(text)}
                />
              </View>
              <View style={styles.formInput}>
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="email address"
                  value={email}
                  onChangeText={(text) => handleEmailChange(text)}
                />
              </View>

              <View style={styles.formInput}>
                <TextInput
                  style={[styles.textInput, { width: "87%" }]}
                  placeholder="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => handlePasswordChange(text)}
                />
                <TouchableOpacity
                  style={styles.icons}
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={25}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.infoText}>
              Must contain at least 8 characters
            </Text>
            <View style={{ paddingTop: 10 }}>
              <TouchableText
                fontFamily="LexendLight"
                fontSize={13}
                onPress={() => navigation.navigate("Login")}
                fontcolor="black"
                textDecor="underline"
                alignSelf="flex-end"
              >
                Already have an account
              </TouchableText>
            </View>
            <View style={styles.buttonWrapper}>
              {canSubmit ? (
                <CustomButton
                  background="maroon"
                  onPress={() => {
                    register(firstName, lastName, phoneNumber, email, password);
                  }}
                >
                  Sign up
                </CustomButton>
              ) : (
                <CustomButton
                  disabled={true}
                  background="grey"
                  onPress={() => {
                    register(firstName, lastName, phoneNumber, email, password);
                  }}
                >
                  Sign up
                </CustomButton>
              )}
            </View>
            <View style={styles.errorMessageWrapper}>
              {signUpErrorExist ? (
                <Text style={styles.errorText}>{signUpErrorMessage}</Text>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  warpper: {
    flex: 1,
  },
  scrollableContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    fontFamily: "LexendLight",
    fontSize: 20,
    padding: 10,
  },
  nameInputWrap: {
    marginTop: 20,
    flexDirection: "row",
    gap: 30,
  },
  nameInputcontainer: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.black,
    width: windowWidth / 2.61,
    flexDirection: "row",
    alignItems: "center",
  },
  formWrapper: {
    marginTop: 20,
    paddingHorizontal: 25,
  },
  formInput: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.black,
    width: windowWidth / 1.175,
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    paddingTop: 5,
    fontFamily: "LexendExtraLight",
    fontSize: 12,
    textAlign: "left",
    color: Colors.black,
  },
  buttonWrapper: {
    alignItems: "center",
    paddingTop: 15,
  },
  errorMessageWrapper: {
    alignItems: "center",
    paddingTop: 10,
  },
  errorText: {
    color: Colors.maroon,
    fontSize: 12,
    fontFamily: "LexendRegular",
  },
  icons: {
    marginLeft: 5,
    marginRight: 10,
  },
});

export default RegisterScreen;
