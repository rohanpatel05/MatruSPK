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

const AddProductScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [imageData, setImageData] = useState(null);

  const isFormNotEmpty =
    name.trim() !== "" &&
    description.trim() !== "" &&
    price.trim() !== "" &&
    categoryId.trim() !== "" &&
    quantityAvailable.trim() !== "" &&
    imageData !== null;

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

  const addProduct = async () => {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price.trim());
    formData.append("category_id", categoryId.trim());
    formData.append("quantity_available", quantityAvailable.trim());
    formData.append("image", {
      uri: imageData.uri,
      type: imageData.type,
      name: name,
    });

    setShowMessage(false);
    setMessage("");
    setIsLoading(true);
    await axios
      .post(`${BASE_URL}/products/create`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo.accessToken}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setShowMessage(true);
        setMessage(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        setCategoryId("");
        setQuantityAvailable("");
        setImageData(null);
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
  }, [name, description, price, categoryId, quantityAvailable, imageData]);

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
          <Text style={styles.heading}>Add Product</Text>

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
          </View>

          <View style={styles.imagePickerWrapper}>
            <TouchableOpacity
              style={[styles.buttonWrapper, { backgroundColor: Colors.maroon }]}
              onPress={pickImage}
            >
              <Text style={styles.buttonText}>Pick a product image</Text>
            </TouchableOpacity>
            {imageData?.uri && (
              <Image
                source={{ uri: imageData.uri }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.buttonWrapper,
              canSubmit
                ? { backgroundColor: Colors.maroon }
                : { backgroundColor: Colors.grey },
            ]}
            disabled={!canSubmit}
            onPress={addProduct}
          >
            <Text style={styles.buttonText}>Add product</Text>
          </TouchableOpacity>

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
    marginBottom: 10,
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
});

export default AddProductScreen;
