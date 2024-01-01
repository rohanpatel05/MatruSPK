import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const ProductManagementScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState(null);

  const isFocused = useIsFocused();

  const getProducts = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setProducts(response.data);
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

  const refreshProducts = async () => {
    await getProducts();
  };

  const handleSelectNavigation = (item) => {
    navigation.navigate("ProductOperation", { product: item });
  };

  const handleAddNavigation = () => {
    navigation.navigate("AddProduct");
  };

  useEffect(() => {
    if (isFocused) {
      refreshProducts();
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
            <TouchableOpacity
              style={[styles.buttonWrapper, { backgroundColor: Colors.maroon }]}
              onPress={handleAddNavigation}
            >
              <Text style={styles.buttonText}>Add a new product</Text>
            </TouchableOpacity>
          </View>

          {products &&
            products.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() => {
                    handleSelectNavigation(item);
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
    paddingTop: 10,
    paddingBottom: 30,
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

export default ProductManagementScreen;
