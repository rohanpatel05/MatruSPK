import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Spinner from "react-native-loading-spinner-overlay";
import Colors from "../../config/Colors";

const windowWidth = Dimensions.get("window").width;

const CategoryOperationScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [hiddenStatus, setHiddenStatus] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const isFormNotEmpty = name.trim() !== "" && hiddenStatus.trim() !== "";

  const updateCategory = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/categories/${category.category_id}`,
        {
          name: name.trim(),
          hidden: hiddenStatus.trim(),
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        navigation.goBack();
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

  const removeCategory = async () => {
    setIsLoading(true);
    return await axios
      .delete(`${BASE_URL}/categories/${category.category_id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then(() => {
        navigation.goBack();
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

  useEffect(() => {
    setCanSubmit(isFormNotEmpty);
  }, [name, hiddenStatus]);

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
      <View style={{ padding: 30, rowGap: 20 }}>
        <Text style={styles.heading}>Category #{category.category_id}</Text>
        <View style={styles.rowWrapper}>
          <Text style={styles.subHeading}>{category.name}</Text>
          {category.hidden === 1 ? (
            <Text style={[styles.subHeading, { color: Colors.maroon }]}>
              Hidden
            </Text>
          ) : (
            <Text style={[styles.subHeading, { color: Colors.dullGreen }]}>
              Not Hidden
            </Text>
          )}
        </View>

        <View>
          <Text style={[styles.secondHeading, { paddingTop: 10 }]}>
            Update Category
          </Text>
          <Text style={{ fontFamily: "InterRegular", fontSize: 16 }}>
            Hidden status: 0=unhide, 1=hide
          </Text>
        </View>

        <View style={styles.rowWrapper}>
          <View
            style={[
              styles.inputComponentsWrapper,
              { width: windowWidth / 2.5 },
            ]}
          >
            <Text style={styles.inputTitle}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="name"
              value={name}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => {
                setName(text);
              }}
            />
          </View>

          <View
            style={[
              styles.inputComponentsWrapper,
              { width: windowWidth / 2.5 },
            ]}
          >
            <Text style={styles.inputTitle}>Hidden status</Text>
            <TextInput
              style={styles.input}
              placeholder="0 or 1"
              value={hiddenStatus}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => {
                setHiddenStatus(text);
              }}
            />
          </View>
        </View>

        <View style={{ alignItems: "center", rowGap: 20 }}>
          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              canSubmit
                ? { backgroundColor: Colors.maroon }
                : { backgroundColor: Colors.grey },
            ]}
            disabled={!canSubmit}
            onPress={updateCategory}
          >
            <Text style={styles.buttonText}>Update category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={removeCategory}
            style={[styles.buttonWrapper, { backgroundColor: Colors.maroon }]}
          >
            <Text style={styles.buttonText}>Delete category</Text>
          </TouchableOpacity>
        </View>

        {showMessage ? (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.errorMessage}>{message}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "auto",
    marginBottom: 10,
  },
  inputComponentsWrapper: {
    rowGap: 5,
  },
  inputTitle: {
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.darkGrey,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGrey,
    fontFamily: "InterRegular",
    fontSize: 20,
    paddingVertical: 5,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "InterBold",
    fontSize: 24,
  },
  subHeading: {
    fontFamily: "InterSemiBold",
    fontSize: 20,
  },
  secondHeading: {
    fontFamily: "InterSemiBold",
    fontSize: 17,
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
});

export default CategoryOperationScreen;
