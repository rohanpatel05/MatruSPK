import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import Colors from "../../config/Colors";
import Spinner from "react-native-loading-spinner-overlay";
import { getNonHiddenCategories } from "../../api/categoryApi.js";
import { getNonHiddenProducts } from "../../api/productApi.js";
import ProductItem from "../../components/ProductItem";
import {
  APP_TITLE,
  SERVICE_ERROR_HEADER,
  SERVICE_ERROR_MESSAGE,
} from "../../config/descriptionConfig";
import { useQueryClient } from "@tanstack/react-query";
import {
  GET_NON_HIDDEN_CATEGORIES_QUERY_KEY,
  GET_NON_HIDDEN_PRODUCTS_QUERY_KEY,
} from "../../config/queryKeys";
import TopBar from "../../components/TopBar";

const windowHeight = Dimensions.get("window").height;

const HomeScreen = ({ navigation }) => {
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: getCategoryData,
    isLoading: getCategoryIsLoading,
    isError: getCategoryIsError,
    error: getCategoryError,
  } = getNonHiddenCategories();

  const {
    data: getProductData,
    isLoading: getProductIsLoading,
    isError: getProductIsError,
    error: getProductError,
  } = getNonHiddenProducts();

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await queryClient.invalidateQueries({
        queryKey: [GET_NON_HIDDEN_CATEGORIES_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [GET_NON_HIDDEN_PRODUCTS_QUERY_KEY],
      });

      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setRefreshing(false);
    }
  };

  if (getCategoryIsError || getProductIsError) {
    return (
      <SafeAreaView>
        <TopBar
          displayBackButton={false}
          displayCart={false}
          centerText={APP_TITLE}
          navigation={navigation}
        />

        <View style={styles.serviceErrorMessageWrapper}>
          <Text style={styles.serviceErrorHeader}>{SERVICE_ERROR_HEADER}</Text>
          <Text style={styles.serviceErrorMessage}>
            {SERVICE_ERROR_MESSAGE}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <Spinner visible={getCategoryIsLoading || getProductIsLoading} />

      <TopBar
        displayBackButton={false}
        displayCart={true}
        centerText={APP_TITLE}
        navigation={navigation}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View>
          <ScrollView
            horizontal
            style={styles.categoryScrollWrapper}
            showsHorizontalScrollIndicator={false}
          >
            {getCategoryData &&
              getCategoryData.map((item) => (
                <TouchableOpacity
                  style={styles.categorySelector}
                  key={item.category_id}
                  onPress={() => setActiveCategory(item.category_id)}
                >
                  <Text
                    style={[
                      styles.categorySelectorText,
                      activeCategory === item.category_id && {
                        color: Colors.maroon,
                        fontWeight: "800",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <View style={styles.productListWrapper}>
          <View>
            {getProductData ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginVertical: 20,
                }}
              >
                {activeCategory === 0
                  ? getProductData.map((item) => (
                      <ProductItem
                        key={item.product_id}
                        item={item}
                        navigation={navigation}
                      />
                    ))
                  : getProductData
                      .filter((item) => item.category_id === activeCategory)
                      .map((filteredItem) => (
                        <ProductItem
                          key={filteredItem.product_id}
                          item={filteredItem}
                          navigation={navigation}
                        />
                      ))}
              </View>
            ) : (
              <Spinner visible />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorMessageWrapper: {
    alignItems: "center",
    paddingTop: 10,
  },
  errorMessage: {
    color: Colors.maroon,
    fontSize: 12,
    fontFamily: "LexendRegular",
  },
  serviceErrorMessageWrapper: {
    marginTop: windowHeight * 0.3,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  serviceErrorHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
    color: Colors.maroon,
  },
  serviceErrorMessage: {
    color: Colors.maroon,
    fontSize: 14,
    fontFamily: "InterRegular",
    textAlign: "center",
    marginBottom: 30,
  },
  categoryScrollWrapper: {
    padding: 8,
  },
  categorySelector: {
    marginRight: 15,
    marginLeft: 15,
  },
  categorySelectorText: {
    fontWeight: "700",
    fontSize: 18,
    color: Colors.darkGrey,
  },
  productListWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
});

export default HomeScreen;
