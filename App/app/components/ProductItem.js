import React from "react";
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import Colors from "../config/Colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ProductItem = ({ item, navigation }) => {
  return (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        navigation.navigate("ProductDetail", {
          product: item,
        });
      }}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Rs. {item.price}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productItem: {
    width: windowWidth * 0.42,
    marginBottom: windowHeight * 0.02,
    padding: windowWidth * 0.02,
    borderRadius: windowWidth * 0.02,
  },
  productImage: {
    width: windowWidth * 0.39,
    height: windowWidth * 0.39,
    resizeMode: "cover",
    borderRadius: windowWidth * 0.02,
  },
  productName: {
    fontFamily: "InterBold",
    fontSize: windowWidth * 0.05,
    marginTop: windowHeight * 0.01,
  },
  productPrice: {
    fontFamily: "InterLight",
    fontSize: windowWidth * 0.04,
    color: Colors.black,
    marginTop: windowHeight * 0.01,
  },
});

export default ProductItem;
