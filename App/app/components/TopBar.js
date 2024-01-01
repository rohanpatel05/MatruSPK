import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import React from "react";
import CustomText from "./CustomText";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";

const TopBar = ({
  displayBackButton,
  buttonName,
  displayCart,
  centerText,
  navigation,
}) => {
  return (
    <View>
      <View style={styles.topTabFirstRow}>
        {displayBackButton === true ? (
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name={buttonName} size={35} />
          </TouchableOpacity>
        ) : (
          <View>
            <Text>{"\t"}</Text>
          </View>
        )}

        <View>
          <CustomText color="black" fontFamily="InterMedium" fontSize={24}>
            {centerText}
          </CustomText>
        </View>

        {displayCart === true ? (
          <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
            <Feather name="shopping-bag" size={30} />
          </TouchableOpacity>
        ) : (
          <View>
            <Text>{"\t"}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topTabFirstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default TopBar;
