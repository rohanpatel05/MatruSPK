import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import StaffTopBar from "../../components/StaffTopBar.js";
import { APP_TITLE } from "../../config/descriptionConfig";
import ProfileOption from "../../components/ProfileOption.js";

const AdminHomeScreen = ({ navigation }) => {
  const handleStaffOnPress = () => {
    navigation.navigate("StaffManagement");
  };

  const handleProductCategoriesOnPress = () => {
    navigation.navigate("CategoryMangement");
  };

  const handleProductsOnPress = () => {
    navigation.navigate("ProductManagement");
  };

  const handleDeliverableZipCodesOnPress = () => {
    navigation.navigate("ZipCodeManagement");
  };

  const handleChargeRatesOnPress = () => {
    navigation.navigate("ChargeRateManagement");
  };

  const handlePaymentOnPress = () => {
    navigation.navigate("Payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StaffTopBar
        displayBackButton={false}
        centerText={APP_TITLE}
        displayLogout={true}
      />
      <View style={styles.headerWrapper}>
        <Text style={styles.header}>Admin portal</Text>
        <Text style={styles.description}>Please select option to manage</Text>
      </View>

      <ProfileOption name="Staff" onPress={handleStaffOnPress} />
      <ProfileOption
        name="Product Categories"
        onPress={handleProductCategoriesOnPress}
      />
      <ProfileOption name="Products" onPress={handleProductsOnPress} />
      <ProfileOption
        name="Deliverable Zip Codes"
        onPress={handleDeliverableZipCodesOnPress}
      />
      <ProfileOption name="Charge Rates" onPress={handleChargeRatesOnPress} />
      <ProfileOption name="View Payments" onPress={handlePaymentOnPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingVertical: 45,
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 0.25,
  },
  header: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
  },
  description: {
    fontFamily: "InterRegular",
    marginTop: 5,
    fontSize: 16,
  },
});

export default AdminHomeScreen;
