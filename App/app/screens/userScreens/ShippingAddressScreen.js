import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import {
  APP_TITLE,
  NETWORK_ERROR_HEADER,
  NETWORK_ERROR_MESSAGE,
  SPLIT_MARKER,
} from "../../config/descriptionConfig";
import Spinner from "react-native-loading-spinner-overlay";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";

const windowWidth = Dimensions.get("window").width;

const ShippingAddressScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [updatedStreetAddress, setUpdatedStreetAddress] = useState("");
  const [updatedStreetAddress2, setUpdatedStreetAddress2] = useState("");
  const [updatedCity, setUpdatedCity] = useState("");
  const [updatedZip, setUpdatedZip] = useState("");
  const [updatedState, setUpdatedState] = useState("");

  const zipRegex = /^[0-9]{6}$/;
  const indianStateAbbreviationRegex =
    /^(?:AP|AR|AS|BR|CG|GA|GJ|HR|HP|JH|KA|KL|MP|MH|MN|ML|MZ|NL|OR|PB|RJ|SK|TN|TG|TR|UP|UT|WB)$/;

  const isFormChanged =
    streetAddress.trim() !== updatedStreetAddress.trim() ||
    city.trim() !== updatedCity.trim() ||
    zip.trim() !== updatedZip.trim() ||
    state.trim() !== updatedState.trim();

  const isFormNotEmpty =
    updatedStreetAddress.trim() !== "" && updatedCity.trim() !== "";

  const isValidZip = zipRegex.test(updatedZip);
  const isValidState = indianStateAbbreviationRegex.test(updatedState);

  const createAddressString = () => {
    const address =
      updatedStreetAddress.trim() +
      SPLIT_MARKER +
      updatedStreetAddress2.trim() +
      SPLIT_MARKER +
      updatedCity.trim() +
      SPLIT_MARKER +
      updatedState.trim() +
      SPLIT_MARKER +
      updatedZip.trim();
    return address;
  };

  const getUserAddress = async () => {
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/users/${userInfo.user.email}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        if (response.data.address !== null) {
          const parts = response.data.address.split(SPLIT_MARKER);
          setStreetAddress(parts[0]);
          setCity(parts[2]);
          setState(parts[3]);
          setZip(parts[4]);

          setUpdatedStreetAddress(parts[0]);
          setUpdatedStreetAddress2(parts[1]);
          setUpdatedCity(parts[2]);
          setUpdatedState(parts[3]);
          setUpdatedZip(parts[4]);
        }
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

  const updateAddress = async () => {
    const address = createAddressString();

    setIsSuccessful(false);
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/users/updateAdd/${userInfo.user.email}`,
        { address: address },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setIsSuccessful(true);

        setStreetAddress(updatedStreetAddress.trim());
        setCity(updatedCity.trim());
        setState(updatedState.trim());
        setZip(updatedZip.trim());
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
    getUserAddress();
  }, []);

  useEffect(() => {
    setCanSubmit(isFormChanged && isFormNotEmpty && isValidZip && isValidState);
  }, [
    updatedStreetAddress,
    updatedCity,
    updatedState,
    updatedZip,
    streetAddress,
    city,
    state,
    zip,
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
            <Text style={styles.heading}>Address</Text>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>Street address</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                value={updatedStreetAddress}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setUpdatedStreetAddress(text);
                }}
              />
            </View>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>Street address 2 (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment number or Street"
                value={updatedStreetAddress2}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setUpdatedStreetAddress2(text);
                }}
              />
            </View>

            <View style={styles.inputComponentsWrapper}>
              <Text style={styles.inputTitle}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Surat"
                value={updatedCity}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setUpdatedCity(text);
                }}
              />
            </View>

            <View style={styles.nameInputWrapper}>
              <View
                style={[
                  styles.inputComponentsWrapper,
                  { width: windowWidth / 2.5 },
                ]}
              >
                <Text style={styles.inputTitle}>Zip</Text>
                <TextInput
                  style={styles.input}
                  placeholder="_ _ _ _ _ _"
                  value={updatedZip}
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setUpdatedZip(text);
                  }}
                />
              </View>

              <View
                style={[
                  styles.inputComponentsWrapper,
                  { width: windowWidth / 2.5 },
                ]}
              >
                <Text style={styles.inputTitle}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="GJ"
                  value={updatedState}
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setUpdatedState(text);
                  }}
                />
                <Text style={{ color: Colors.darkGrey, marginLeft: 10 }}>
                  state abbreviation
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "center", rowGap: 20 }}>
              {canSubmit ? (
                <CustomButton
                  background="maroon"
                  onPress={() => {
                    updateAddress();
                  }}
                >
                  Save
                </CustomButton>
              ) : (
                <CustomButton disabled={true} background="grey">
                  Save
                </CustomButton>
              )}
              {isSuccessful ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.successMessage}>
                    Address saved successfully!
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
  nameInputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
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
});

export default ShippingAddressScreen;
