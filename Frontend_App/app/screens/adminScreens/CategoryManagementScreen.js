import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { BASE_URL } from "../../config/URL";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Spinner from "react-native-loading-spinner-overlay";
import Colors from "../../config/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const CategoryManagementScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCatgories] = useState(null);
  const [addName, setAddName] = useState("");
  const [canAddSubmit, setCanAddSubmit] = useState(false);

  const isFocused = useIsFocused();

  const getCatgories = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setCatgories(response.data);
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

  const addCategory = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .post(
        `${BASE_URL}/categories`,
        {
          name: addName.trim(),
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        setAddName("");
        refreshCategory();
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

  const refreshCategory = async () => {
    await getCatgories();
  };

  const handleNavigation = (item) => {
    navigation.navigate("CategoryOperation", { category: item });
  };

  useEffect(() => {
    setCanAddSubmit(addName.trim() !== "");
  }, [addName]);

  useEffect(() => {
    if (isFocused) {
      refreshCategory();
    }
  }, [isFocused]);

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
        <View style={{ paddingBottom: 40 }}>
          <View style={styles.addWrapper}>
            <View
              style={[
                styles.inputComponentsWrapper,
                { width: windowWidth / 1.2, marginTop: 10 },
              ]}
            >
              <Text style={styles.inputTitle}>Category name</Text>
              <TextInput
                style={styles.input}
                placeholder="name"
                value={addName}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => {
                  setAddName(text);
                }}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.buttonWrapper,
                canAddSubmit
                  ? { backgroundColor: Colors.maroon }
                  : { backgroundColor: Colors.grey },
              ]}
              disabled={!canAddSubmit}
              onPress={addCategory}
            >
              <Text style={styles.buttonText}>Add a new category</Text>
            </TouchableOpacity>
          </View>

          {categories &&
            categories.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() => {
                    handleNavigation(item);
                  }}
                >
                  <View style={styles.resultContainer}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={25} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}

          {showMessage ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.errorMessage}>{message}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addWrapper: {
    alignItems: "center",
    rowGap: 30,
    marginBottom: 20,
  },
  buttonWrapper: {
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
  resultContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    alignItems: "center",
  },
  optionName: {
    fontFamily: "InterMedium",
    fontSize: 20,
  },
});

export default CategoryManagementScreen;
