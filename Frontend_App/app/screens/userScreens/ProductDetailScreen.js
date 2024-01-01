import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import Colors from "../../config/Colors";
import TopBar from "../../components/TopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import Spinner from "react-native-loading-spinner-overlay";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import CustomButton from "../../components/CustomButton";
import {
  PRODUCT_OUT_OF_STOCK,
  SPLIT_MARKER,
  PRODUCT_NO_LONGER_AVAILABLE_HEADER,
  PRODUCT_NO_LONGER_AVAILABLE_MESSAGE,
} from "../../config/descriptionConfig";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { userInfo } = useContext(AuthContext);

  const [description, setDescription] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [outOfStockMessage, setOutOfStockMessage] = useState("");
  const [productNA, setProductNA] = useState(false);

  const getProductInfo = async () => {
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/products/${product.product_id}`)
      .then((response) => {
        setProductInfo(response.data);

        const descriptionParts = response.data.description.split(SPLIT_MARKER);
        setDescription(descriptionParts);

        if (response.data.quantity_available <= 0) {
          setOutOfStockMessage(PRODUCT_OUT_OF_STOCK);
        }
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setProductNA(true);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const addItemToCart = async () => {
    setIsLoading(true);
    setMessage("");
    return await axios
      .post(
        `${BASE_URL}/cartitems/${userInfo.cart.cart_id}`,
        { product_id: product.product_id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        setMessage(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  const showMessage = () => {
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const addToCart = () => {
    addItemToCart();
    showMessage();
  };

  useEffect(() => {
    getProductInfo();
  }, []);

  if (productNA) {
    return (
      <SafeAreaView>
        <Spinner visible={isLoading} />

        <TopBar
          displayBackButton={true}
          buttonName={"chevron-back"}
          displayCart={false}
          centerText={APP_TITLE}
          navigation={navigation}
        />

        <View style={styles.emptyPurchaseWrapper}>
          <Text style={styles.emptyPurchaseHeader}>
            {PRODUCT_NO_LONGER_AVAILABLE_HEADER}
          </Text>
          <Text style={styles.emptyPurchaseDescription}>
            {PRODUCT_NO_LONGER_AVAILABLE_MESSAGE}
          </Text>

          <CustomButton
            background={"dullGreen"}
            disabled={false}
            onPress={() => {
              navigation.goBack();
            }}
          >
            Start shopping
          </CustomButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={true}
        buttonName={"chevron-back"}
        displayCart={true}
        centerText={APP_TITLE}
        navigation={navigation}
      />

      {productInfo && (
        <ScrollView style={{ flex: 1 }}>
          <Image
            source={{ uri: productInfo.image_url }}
            style={styles.productImage}
          />
          <View style={styles.infoContainer}>
            <View style={styles.nameAndPrice}>
              <Text style={styles.productName}>{productInfo.name}</Text>
              <Text style={styles.productPrice}>Rs. {productInfo.price}</Text>
            </View>
            <Text style={styles.productDescription}>{description[0]}</Text>
            {description.length > 1 && (
              <Text style={styles.productSecondDescription}>
                {"\n"}
                {description[1]}
              </Text>
            )}

            {outOfStockMessage ? (
              <View>
                <TouchableOpacity
                  disabled
                  onPress={addToCart}
                  style={styles.disabledAddToCartButton}
                >
                  <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                </TouchableOpacity>

                <View style={styles.errorMessageWrapper}>
                  <Text style={styles.errorMessage}>{outOfStockMessage}</Text>
                </View>
              </View>
            ) : (
              <View>
                {productInfo.quantity_available <= 5 && (
                  <View style={styles.errorMessageWrapper}>
                    <Text style={styles.fewItemMessage}>
                      Only few items remaining in stock.
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={addToCart}
                  style={styles.addToCartButton}
                >
                  <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                </TouchableOpacity>

                {message && (
                  <View style={styles.errorMessageWrapper}>
                    <Text style={styles.errorMessage}>{message}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: 25,
    paddingBottom: 15,
    paddingTop: 5,
  },
  nameAndPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  productImage: {
    width: windowWidth,
    height: windowWidth * 1.1,
    resizeMode: "cover",
  },
  productName: {
    fontFamily: "InterSemiBold",
    fontSize: windowWidth * 0.052,
  },
  productDescription: {
    fontFamily: "InterRegular",
    fontSize: windowWidth * 0.038,
    marginTop: 8,
  },
  productSecondDescription: {
    fontFamily: "InterRegular",
    fontSize: windowWidth * 0.038,
  },
  productPrice: {
    fontFamily: "InterRegular",
    fontSize: windowWidth * 0.042,
  },
  addToCartButton: {
    backgroundColor: Colors.dullGreen,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    alignSelf: "center",
    alignItems: "center",
    width: windowWidth * 0.55,
  },
  disabledAddToCartButton: {
    backgroundColor: Colors.grey,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    alignSelf: "center",
    alignItems: "center",
    width: windowWidth * 0.55,
  },
  addToCartButtonText: {
    fontFamily: "InterSemiBold",
    color: "white",
    fontSize: 20,
  },
  scrollViewContainer: {
    height: "100%",
  },
  errorMessageWrapper: {
    alignItems: "center",
    paddingTop: 10,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 12,
    fontFamily: "LexendRegular",
  },
  fewItemMessage: {
    color: Colors.dullGreen,
    fontSize: 15,
    fontFamily: "LexendRegular",
  },
  emptyPurchaseWrapper: {
    marginTop: windowHeight * 0.3,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  emptyPurchaseHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.maroon,
  },
  emptyPurchaseDescription: {
    fontFamily: "InterRegular",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
});

export default ProductDetailScreen;
