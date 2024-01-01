import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AdminHomeScreen,
  StaffManagementScreen,
  CategoryManagementScreen,
  CategoryOperationScreen,
  ProductManagementScreen,
  AddProductScreen,
  ProductOperationScreen,
  ZipCodeManagementScreen,
  ChargeRateManagementScreen,
  PaymentScreen,
} from "../screens/adminScreens";

const Stack = createNativeStackNavigator();

const AdminNavStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
      <Stack.Screen
        name="CategoryMangement"
        component={CategoryManagementScreen}
      />
      <Stack.Screen
        name="CategoryOperation"
        component={CategoryOperationScreen}
      />
      <Stack.Screen
        name="ProductManagement"
        component={ProductManagementScreen}
      />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen
        name="ProductOperation"
        component={ProductOperationScreen}
      />
      <Stack.Screen
        name="ZipCodeManagement"
        component={ZipCodeManagementScreen}
      />
      <Stack.Screen
        name="ChargeRateManagement"
        component={ChargeRateManagementScreen}
      />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavStack;
