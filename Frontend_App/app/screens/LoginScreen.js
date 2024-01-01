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
import CustomText from "../components/CustomText.js";
import DisplayLogo from "../components/DisplayLogo.js";
import Colors from "../config/Colors.js";
import TouchableText from "../components/TouchableText.js";
import CustomButton from "../components/CustomButton.js";
import { AuthContext } from "../context/AuthContext.js";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, login, signInErrorExist, signInErrorMessage } =
    useContext(AuthContext);

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (!email || email.trim() === "" || !password || password.trim() === "") {
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
          <DisplayLogo height={windowHeight / 2.3} width={windowWidth} />
          <View>
            <CustomText
              fontFamily="LibreBaskervilleBold"
              fontSize={36}
              textAlign="center"
              color="black"
            >
              Welcome Back!
            </CustomText>
          </View>
          <View style={styles.fromWrapper}>
            <View style={{ rowGap: 25, alignItems: "center" }}>
              <View style={styles.formInput}>
                <TextInput
                  style={styles.textInput}
                  placeholder="email address"
                  value={email}
                  autoCapitalize="none"
                  autoCorrect={false}
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
                onPress={() => navigation.navigate("Register")}
                fontcolor="black"
                textDecor="underline"
                alignSelf="flex-end"
              >
                Create an account
              </TouchableText>
            </View>
            <View style={styles.buttonWrapper}>
              {canSubmit ? (
                <CustomButton
                  background="maroon"
                  onPress={() => {
                    login(email, password);
                  }}
                >
                  Sign in
                </CustomButton>
              ) : (
                <CustomButton
                  disabled={true}
                  background="grey"
                  onPress={() => {
                    login(email, password);
                  }}
                >
                  Sign in
                </CustomButton>
              )}
            </View>
            <View style={styles.errorMessageWrapper}>
              {signInErrorExist ? (
                <Text style={styles.errorText}>{signInErrorMessage}</Text>
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
  fromWrapper: {
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

export default LoginScreen;
