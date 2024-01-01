import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import TopBar from "../../components/TopBar";
import {
  APP_TITLE,
  NO_ORDERS_HEADER,
  NO_ORDERS_MESSAGE,
} from "../../config/descriptionConfig";
import axios from "axios";
import { BASE_URL } from "../../config/URL";
import Spinner from "react-native-loading-spinner-overlay";
import Colors from "../../config/Colors";
import CustomButton from "../../components/CustomButton";
import OrderList from "../../components/OrderList";

const windowHeight = Dimensions.get("window").height;

const OrdersScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isNoOrderHistory, setIsNoOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getOrderHistory = async () => {
    setIsLoading(true);
    setIsNoOrderHistory(false);
    return await axios
      .get(`${BASE_URL}/orders/byUser/${userInfo.user.email}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` },
      })
      .then((response) => {
        setOrderHistory(response.data);
        setIsNoOrderHistory(false);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setIsNoOrderHistory(true);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await getOrderHistory();

    setRefreshing(false);
  };

  useEffect(() => {
    getOrderHistory();
  }, []);

  if (isNoOrderHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner visible={isLoading} />

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
          <View style={styles.emptyPurchaseWrapper}>
            <Text style={styles.emptyPurchaseHeader}>{NO_ORDERS_HEADER}</Text>
            <Text style={styles.emptyPurchaseDescription}>
              {NO_ORDERS_MESSAGE}
            </Text>

            <CustomButton
              background={"dullGreen"}
              disabled={false}
              onPress={() => {
                navigation.navigate("Home");
              }}
            >
              Start shopping
            </CustomButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={isLoading} />

      <TopBar
        displayBackButton={false}
        displayCart={true}
        centerText={APP_TITLE}
        navigation={navigation}
      />
      <View style={styles.headerWrapper}>
        <Text style={styles.screenHeader}>Order History</Text>
      </View>

      {orderHistory && (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.order_id}
          renderItem={({ item }) => <OrderList orders={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  screenHeader: {
    fontFamily: "InterSemiBold",
    fontSize: 21,
    padding: 20,
  },
  headerWrapper: {
    borderBottomWidth: 0.25,
  },
});

export default OrdersScreen;
