import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState, useEffect } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import Colors from "../../config/Colors";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Spinner from "react-native-loading-spinner-overlay";
import Ionicons from "react-native-vector-icons/Ionicons";

const windowWidth = Dimensions.get("window").width;

const StaffManagementScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [staffMembers, setStaffMembers] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const isFormNotEmpty =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "";

  const getAllStaff = async () => {
    setStaffMembers(null);
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setStaffMembers(response.data);
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

  const addNewStaff = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .post(
        `${BASE_URL}/users/registerStaff`,
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password: password.trim(),
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then((response) => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setShowMessage(true);
        setMessage(response.data.message);
        refreshStaff();
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

  const removeStaff = async (email) => {
    return await axios
      .delete(`${BASE_URL}/users/${email}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        refreshStaff();
      });
  };

  const refreshStaff = async () => {
    await getAllStaff();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setCanSubmit(isFormNotEmpty);
  }, [firstName, lastName, email, password]);

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
          <View style={styles.formWrapper}>
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
                  placeholder="first"
                  value={firstName}
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setFirstName(text);
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
                  placeholder="last"
                  value={lastName}
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setLastName(text);
                  }}
                />
              </View>
            </View>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="email address"
                value={email}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => {
                  setEmail(text);
                }}
              />
            </View>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>New password</Text>
              <View style={styles.passWrapper}>
                <TextInput
                  style={[styles.passInput, { width: "90%" }]}
                  placeholder="enter a strong password"
                  value={password}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={25}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.getButtonWrapper,
              canSubmit
                ? { backgroundColor: Colors.maroon }
                : { backgroundColor: Colors.grey },
            ]}
            disabled={!canSubmit}
            onPress={addNewStaff}
          >
            <Text style={styles.buttonText}>Add a new staff</Text>
          </TouchableOpacity>

          <View style={{ rowGap: 15, alignItems: "center" }}>
            <TouchableOpacity
              style={[
                styles.getButtonWrapper,
                { backgroundColor: Colors.maroon },
              ]}
              onPress={refreshStaff}
            >
              <Text style={styles.buttonText}>Get all staff members</Text>
            </TouchableOpacity>

            {showMessage ? (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.errorMessage}>{message}</Text>
              </View>
            ) : null}

            {staffMembers &&
              staffMembers.map((item, index) => (
                <View key={index} style={styles.resultWrapper}>
                  <View style={styles.resultTextWrapper}>
                    <Text style={styles.resultText}>
                      {item.first_name} {item.last_name}, {"\n"}
                      {item.email}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        removeStaff(item.email);
                      }}
                    >
                      <Text
                        style={[styles.resultText, { color: Colors.maroon }]}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
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
    marginBottom: 40,
  },
  formWrapper: {
    marginTop: 20,
    rowGap: 30,
  },
  getButtonWrapper: {
    width: 200,
    height: 37,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 10,
  },
  nameInputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  passInput: {
    padding: 10,
    fontFamily: "InterRegular",
    fontSize: 20,
    padding: 10,
  },
  passWrapper: {
    borderRadius: 12,
    width: windowWidth / 1.175,
    flexDirection: "row",
    alignItems: "center",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
  },
  resultWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 5,
  },
  resultTextWrapper: {
    rowGap: 1,
    flex: 1,
  },
  resultText: {
    fontFamily: "InterRegular",
    fontSize: 16,
  },
});

export default StaffManagementScreen;
