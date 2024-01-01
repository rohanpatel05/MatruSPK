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
import React, { useContext, useEffect, useState } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Colors from "../../config/Colors";

const windowWidth = Dimensions.get("window").width;

const StaffProductScreen = () => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [products, setProducts] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const idRegex = /^[1-9][0-9]{0,10}$/;

  const isFormNotEmpty = productId.trim() !== "" && quantity.trim() !== "";

  const getProducts = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/products/`, {
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

  const updateProducts = async () => {
    const trimmedProductId = productId.trim();
    const trimmedQty = quantity.trim();

    if (!idRegex.test(trimmedProductId)) {
      setShowMessage(true);
      setMessage("Invalid product id value.");
      return;
    }

    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/products/updatePQ/${trimmedProductId}`,
        {
          quantity_available: trimmedQty,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then(() => {
        refreshProducts();
        setProductId("");
        setQuantity("");
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

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    setCanSubmit(isFormNotEmpty);
  }, [productId, quantity]);

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />
      <StaffTopBar
        displayBackButton={false}
        centerText={APP_TITLE}
        displayLogout={true}
      />
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={{ rowGap: 25 }}>
            <View style={{ paddingHorizontal: 25, rowGap: 25 }}>
              <Text style={styles.header}>Update Product Qty.</Text>

              <View style={styles.rowWrapper}>
                <View
                  style={[
                    styles.inputComponentsWrapper,
                    { width: windowWidth / 2.5 },
                  ]}
                >
                  <Text style={styles.inputTitle}>Product id</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="id #"
                    value={productId}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setProductId(text);
                    }}
                  />
                </View>

                <View
                  style={[
                    styles.inputComponentsWrapper,
                    { width: windowWidth / 2.5 },
                  ]}
                >
                  <Text style={styles.inputTitle}>Quantity available</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="qty."
                    value={quantity}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setQuantity(text);
                    }}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.buttonWrapper,
                canSubmit
                  ? { backgroundColor: Colors.maroon }
                  : { backgroundColor: Colors.grey },
              ]}
              disabled={!canSubmit}
              onPress={updateProducts}
            >
              <Text style={styles.buttonText}>Update product qty.</Text>
            </TouchableOpacity>

            {showMessage ? (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.errorMessage}>{message}</Text>
              </View>
            ) : null}

            <View>
              {products &&
                products.map((item, index) => (
                  <View key={index} style={styles.resultContainer}>
                    <Text style={styles.resultText}>
                      Product id: {item.product_id}, {item.name}
                    </Text>
                    <Text style={styles.resultText}>
                      Quantity available: {item.quantity_available}
                    </Text>
                  </View>
                ))}
            </View>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    fontFamily: "InterSemiBold",
    fontSize: 24,
    color: Colors.black,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "auto",
  },
  resultContainer: {
    borderBottomWidth: 0.25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputComponentsWrapper: {
    rowGap: 5,
  },
  inputTitle: {
    fontFamily: "InterRegular",
    fontSize: 16,
    color: Colors.darkGrey,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: Colors.darkGrey,
    fontFamily: "InterRegular",
    fontSize: 18,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  buttonWrapper: {
    width: 200,
    height: 37,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontFamily: "InterSemiBold",
    fontSize: 16,
  },
  resultText: {
    fontFamily: "InterRegular",
    fontSize: 16,
  },
});

export default StaffProductScreen;
