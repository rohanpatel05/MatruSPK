import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import React, { useContext } from "react";
import CustomText from "./CustomText";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";

const StaffTopBar = ({
  displayBackButton,
  backButtonName,
  displayLogout,
  centerText,
  navigation,
}) => {
  const { logout } = useContext(AuthContext);

  const handleLogOutOnPress = () => {
    logout();
  };

  return (
    <View>
      <View style={styles.topTabFirstRow}>
        {displayBackButton ? (
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name={backButtonName} size={35} />
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

        {displayLogout ? (
          <TouchableOpacity onPress={handleLogOutOnPress}>
            <Ionicons name="log-out-outline" size={30} />
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

export default StaffTopBar;
