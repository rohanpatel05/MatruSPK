import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabNav from "./BottomTabNav.js";

import {
  CartScreen,
  ProductDetailScreen,
  EditProfileScreen,
  UpdateEmailScreen,
  ChangePasswordScreen,
  DeliveryValidatorScreen,
  DeleteAccountScreen,
  ShippingAddressScreen,
  CheckoutScreen,
  SuccessfulOrderScreen,
} from "../screens/userScreens";

const Stack = createNativeStackNavigator();

const UserNavStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTabNav} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="UpdateEmail" component={UpdateEmailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="DeliveryValidator"
        component={DeliveryValidatorScreen}
      />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="SuccessfulOrder" component={SuccessfulOrderScreen} />
    </Stack.Navigator>
  );
};

export default UserNavStack;
