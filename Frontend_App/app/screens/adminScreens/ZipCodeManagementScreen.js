import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";

const ZipCodeManagementScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [zipcodes, setZipcodes] = useState(null);
  const [addZip, setAddZip] = useState("");

  const zipRegex = /^[0-9]{6}$/;

  const getAllZip = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/delZip`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setZipcodes(response.data);
        setAddZip("");
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
        setZipcodes(null);
      })
      .finally(() => setIsLoading(false));
  };

  const addNewZip = async () => {
    const trimmedZip = addZip.trim();
    if (trimmedZip === "") {
      return;
    }
    if (!zipRegex.test(trimmedZip)) {
      setShowMessage(true);
      setMessage("Invalid zip code.");
      setZipcodes(null);
      return;
    }
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .post(
        `${BASE_URL}/delZip`,
        {
          zipcode: trimmedZip,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setAddZip("");
        refreshZip();
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
        setZipcodes(null);
      })
      .finally(() => setIsLoading(false));
  };

  const refreshZip = async () => {
    await getAllZip();
  };

  const removeZip = async (zipCode) => {
    return await axios
      .delete(`${BASE_URL}/delZip/${zipCode}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        refreshZip();
      });
  };

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
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text style={styles.texts}>Add new zip: </Text>
            <TextInput
              style={[styles.texts, styles.input]}
              placeholder="_ _ _ _ _ _"
              value={addZip}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => {
                setAddZip(text);
              }}
            />
            <TouchableOpacity style={{ marginLeft: 20 }} onPress={addNewZip}>
              <Text style={[styles.texts, { color: Colors.maroon }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buttonWrapper} onPress={refreshZip}>
            <Text style={styles.buttonText}>Get all zip</Text>
          </TouchableOpacity>

          {showMessage ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.errorMessage}>{message}</Text>
            </View>
          ) : null}

          {zipcodes &&
            zipcodes.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.resultText}>Zip code: {item.zipcode}</Text>
                <TouchableOpacity
                  onPress={() => {
                    removeZip(item.zipcode);
                  }}
                >
                  <Text style={[styles.resultText, { color: Colors.maroon }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
    marginTop: 10,
    paddingHorizontal: 30,
  },
  texts: {
    fontFamily: "InterRegular",
    fontSize: 18,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
    width: 80,
  },
  buttonWrapper: {
    width: 200,
    height: 37,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.maroon,
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
  },
  resultText: {
    fontFamily: "InterRegular",
    fontSize: 16,
    flex: 1,
  },
});

export default ZipCodeManagementScreen;
