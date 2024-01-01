import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import StaffTopBar from "../../components/StaffTopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../../config/URL";
import axios from "axios";

const windowWidth = Dimensions.get("window").width;

const ProductOperationScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [canUpdateInfoSubmit, setCanUpdateInfoSubmit] = useState(false);
  const [canUpdateImageSubmit, setCanUpdateImageSubmit] = useState(false);

  const [productInfo, setProductInfo] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [hidden, setHidden] = useState("");
  const [imageData, setImageData] = useState(null);

  const isInfoFormNotEmpty =
    name.trim() !== "" &&
    description.trim() !== "" &&
    price.trim() !== "" &&
    categoryId.trim() !== "" &&
    quantityAvailable.trim() !== "" &&
    hidden.trim() !== "";

  const isImageFormNotEmpty = imageData !== null;

  const isInfoFormChanged =
    name.trim() !== productInfo?.name ||
    description.trim() !== productInfo?.description ||
    price.trim() !== String(productInfo?.price) ||
    categoryId.trim() !== String(productInfo?.category_id) ||
    quantityAvailable.trim() !== String(productInfo?.quantity_available) ||
    hidden.trim() !== String(productInfo?.hidden);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setImageData(result.assets[0]);
    }
  };

  const getProductInfo = async () => {
    setIsLoading(true);
    await axios
      .get(`${BASE_URL}/products/${product.product_id}`)
      .then((response) => {
        setProductInfo(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
        setPrice(String(response.data.price));
        setCategoryId(String(response.data.category_id));
        setQuantityAvailable(String(response.data.quantity_available));
        setHidden(String(response.data.hidden));
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

  const updateProductInfo = async () => {
    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .put(
        `${BASE_URL}/products/updatePI/${product.product_id}`,
        {
          name: name.trim(),
          description: description.trim(),
          price: price.trim(),
          category_id: categoryId.trim(),
          quantity_available: quantityAvailable.trim(),
          hidden: hidden.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.accessToken}`,
          },
        }
      )
      .then((response) => {
        setShowMessage(true);
        setMessage(response.data.message);
        refreshProductInfo();
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

  const updateProductImage = async () => {
    const formData = new FormData();
    formData.append("productName", productInfo.name || "Product");
    formData.append("image", {
      uri: imageData.uri,
      type: imageData.type,
      name: productInfo.name || "productImage",
    });

    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .post(`${BASE_URL}/products/updatePP`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo.accessToken}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setImageData(null);
        setShowMessage(true);
        setMessage(response.data.message);
        refreshProductInfo();
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

  const refreshProductInfo = async () => {
    await getProductInfo();
  };

  useEffect(() => {
    refreshProductInfo();
  }, []);

  useEffect(() => {
    setCanUpdateInfoSubmit(isInfoFormNotEmpty && isInfoFormChanged);
  }, [
    name,
    description,
    price,
    categoryId,
    quantityAvailable,
    hidden,
    productInfo,
  ]);

  useEffect(() => {
    setCanUpdateImageSubmit(isImageFormNotEmpty);
  }, [imageData, productInfo]);

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
          <Text style={styles.heading}>Update Product Info</Text>

          <View style={{ rowGap: 15 }}>
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
                <Text style={styles.inputTitle}>Category id</Text>
                <TextInput
                  style={styles.input}
                  placeholder="id"
                  value={categoryId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setCategoryId(text);
                  }}
                />
              </View>
            </View>

            <View style={styles.rowWrapper}>
              <View
                style={[
                  styles.inputComponentsWrapper,
                  { width: windowWidth / 2.5 },
                ]}
              >
                <Text style={styles.inputTitle}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123.00"
                  value={price}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setPrice(text);
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
                  value={quantityAvailable}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setQuantityAvailable(text);
                  }}
                />
              </View>
            </View>

            <View style={[styles.inputComponentsWrapper]}>
              <Text style={styles.inputTitle}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderWidth: 1,
                    borderRadius: 10,
                    backgroundColor: Colors.lightGrey,
                    height: 140,
                  },
                ]}
                placeholder="description"
                value={description}
                autoCapitalize="none"
                autoCorrect={false}
                textAlignVertical="top"
                textAlign="left"
                editable
                multiline
                onChangeText={(text) => {
                  setDescription(text);
                }}
              />
            </View>

            <View style={[styles.inputComponentsWrapper]}>
              <Text style={styles.inputTitle}>Hidden status</Text>
              <TextInput
                style={styles.input}
                placeholder="0=Unhide or 1=Hide"
                value={hidden}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => {
                  setHidden(text);
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              canUpdateInfoSubmit
                ? { backgroundColor: Colors.maroon }
                : { backgroundColor: Colors.grey },
            ]}
            disabled={!canUpdateInfoSubmit}
            onPress={updateProductInfo}
          >
            <Text style={styles.buttonText}>Update info</Text>
          </TouchableOpacity>

          {showMessage ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.errorMessage}>{message}</Text>
            </View>
          ) : null}

          <Text style={styles.heading}>Update Product Image</Text>

          <View style={styles.imageWrapper}>
            <Text style={styles.secondHeading}>Current Product Image</Text>

            {productInfo && (
              <Image
                source={{ uri: productInfo.image_url }}
                style={{ width: 200, height: 200, alignSelf: "center" }}
              />
            )}
          </View>

          <View style={styles.imagePickerWrapper}>
            <TouchableOpacity
              style={[styles.buttonWrapper, { backgroundColor: Colors.maroon }]}
              onPress={pickImage}
            >
              <Text style={styles.buttonText}>Pick a new image</Text>
            </TouchableOpacity>

            {imageData?.uri && (
              <View style={styles.imageWrapper}>
                <Text style={styles.secondHeading}>New Product Image</Text>
                <Image
                  source={{ uri: imageData.uri }}
                  style={{ width: 200, height: 200 }}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              canUpdateImageSubmit
                ? { backgroundColor: Colors.maroon }
                : { backgroundColor: Colors.grey },
            ]}
            disabled={!canUpdateImageSubmit}
            onPress={updateProductImage}
          >
            <Text style={styles.buttonText}>Update image</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 40,
    rowGap: 30,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 15,
    fontFamily: "InterRegular",
    textAlign: "auto",
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
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "InterBold",
    fontSize: 24,
  },
  secondHeading: {
    fontFamily: "InterSemiBold",
    fontSize: 17,
    alignSelf: "center",
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
  imagePickerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 15,
  },
  imageWrapper: {
    rowGap: 10,
  },
});

export default ProductOperationScreen;
