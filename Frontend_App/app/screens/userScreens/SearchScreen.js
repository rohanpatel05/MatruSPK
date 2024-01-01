import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../config/Colors";
import Feather from "react-native-vector-icons/Feather";
import Spinner from "react-native-loading-spinner-overlay";
import ProductItem from "../../components/ProductItem";
import axios from "axios";
import { BASE_URL } from "../../config/URL";

const windowWidth = Dimensions.get("window").width;

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [getSearchData, setGetSearchData] = useState(null);
  const [getSearchIsLoading, setGetSearchIsLoading] = useState(false);
  const [getSearchIsError, setGetSearchIsError] = useState(false);
  const [getSearchError, setGetSearchError] = useState(null);

  const queryRegex = /^[a-zA-Z0-9' -()]+$/;

  const handleSearch = async () => {
    try {
      setGetSearchIsLoading(true);
      setGetSearchIsError(false);
      setGetSearchError(null);

      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery === "" || !queryRegex.test(searchQuery)) {
        setGetSearchIsError(true);
        setGetSearchError(
          "Please search the product by name or its description."
        );
        return;
      }

      const encodedSearchQuery = encodeURIComponent(trimmedQuery).replace(
        /%20/g,
        "%"
      );

      const response = await axios.get(
        `${BASE_URL}/products/search/${encodedSearchQuery}`
      );

      setGetSearchData(response.data);
    } catch (error) {
      if (error.response) {
        const responseError =
          error.response.data.message || "Unknown error occurred.";
        error.message = responseError;
      } else {
        error.message = "Network error occurred!";
      }

      setGetSearchIsError(true);
      setGetSearchError(error.message);
    } finally {
      setGetSearchIsLoading(false);
    }
  };

  const handleQueryInput = (text) => {
    if (text === null) {
      text = "";
    }
    setSearchQuery(text);
  };

  return (
    <SafeAreaView>
      <Spinner visible={getSearchIsLoading} />

      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handleSearch}>
          <Feather name="search" size={25} style={styles.searchIcon} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholderTextColor={Colors.darkGrey}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={(text) => handleQueryInput(text)}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>
      <ScrollView>
        {getSearchIsError ? (
          <View style={styles.errorMessageWrapper}>
            <Text style={styles.errorMessage}>{getSearchError}</Text>
          </View>
        ) : (
          <View style={styles.searchItemDisplay}>
            {getSearchData ? (
              getSearchData.map((items) => (
                <ProductItem
                  key={items.product_id}
                  item={items}
                  navigation={navigation}
                />
              ))
            ) : (
              <View></View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: Colors.grey,
    borderRadius: 10,
    height: 43,
    alignSelf: "center",
    width: windowWidth / 1.175,
    marginBottom: 15,
    marginTop: 15,
  },
  searchIcon: {
    color: Colors.darkGrey,
    marginHorizontal: 10,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: Colors.grey,
    marginRight: 10,
    borderRadius: 10,
  },
  searchInput: {
    color: Colors.black,
    fontFamily: "InterLight",
    fontSize: 12,
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
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
  searchItemDisplay: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});

export default SearchScreen;
