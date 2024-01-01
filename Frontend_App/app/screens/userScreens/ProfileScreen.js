import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import { APP_TITLE } from "../../config/descriptionConfig";
import ProfileOption from "../../components/ProfileOption";
import Colors from "../../config/Colors";

const windowWidth = Dimensions.get("window").width;

const ProfileScreen = ({ navigation }) => {
  const { logout, userInfo } = useContext(AuthContext);

  const handleEditProfileOnPress = () => {
    navigation.navigate("EditProfile");
  };

  const handleUpdateEmailOnPress = () => {
    navigation.navigate("UpdateEmail");
  };

  const handleChangePasswordeOnPress = () => {
    navigation.navigate("ChangePassword");
  };
  const handleShippingAddressOnPress = () => {
    navigation.navigate("ShippingAddress");
  };

  const handleOrdersOnPress = () => {
    navigation.navigate("Orders");
  };

  const handleDeliveryValidatorOnPress = () => {
    navigation.navigate("DeliveryValidator");
  };

  const handleDeleteAccountOnPress = () => {
    navigation.navigate("DeleteAccount");
  };

  const handleLogOutOnPress = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        displayBackButton={false}
        displayCart={false}
        centerText={APP_TITLE}
        navigation={navigation}
      />

      <ScrollView>
        {userInfo && (
          <View style={styles.nameDisplay}>
            <Text style={styles.nameText}>
              {userInfo.user.first_name} {userInfo.user.last_name}
            </Text>
            <Text style={styles.emailText}>{userInfo.user.email}</Text>
          </View>
        )}

        <View>
          <ProfileOption
            name="Edit Profile"
            onPress={handleEditProfileOnPress}
          />
          <ProfileOption
            name="Update Email Address"
            onPress={handleUpdateEmailOnPress}
          />
          <ProfileOption
            name="Change Password"
            onPress={handleChangePasswordeOnPress}
          />
          <ProfileOption
            name="Address"
            onPress={handleShippingAddressOnPress}
          />
          <ProfileOption name="Orders" onPress={handleOrdersOnPress} />
          <ProfileOption
            name="Delivery Location Validator"
            onPress={handleDeliveryValidatorOnPress}
          />
          <ProfileOption
            name="Delete Account"
            onPress={handleDeleteAccountOnPress}
          />
          <View>
            <TouchableOpacity
              style={styles.logOutOptioncontainer}
              onPress={handleLogOutOnPress}
            >
              <Text style={styles.logOutOptionName}>Log Out</Text>
              <Ionicons name="chevron-forward" size={25} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nameDisplay: {
    paddingVertical: 45,
    alignItems: "center",
    borderBottomWidth: 0.25,
  },
  nameText: {
    fontFamily: "InterSemiBold",
    fontSize: 26,
  },
  emailText: {
    fontFamily: "InterMedium",
    fontSize: 20,
  },
  signoutButtonWrapper: {
    marginTop: 40,
    marginBottom: 20,
  },
  signoutButton: {
    backgroundColor: Colors.black,
    padding: 16,
    marginTop: 16,
    alignSelf: "center",
    alignItems: "center",
    width: windowWidth * 0.5,
  },
  signoutButtonText: {
    fontFamily: "InterSemiBold",
    color: "white",
    fontSize: 20,
  },
  logOutOptioncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    alignItems: "center",
  },
  logOutOptionName: {
    fontFamily: "InterSemiBold",
    fontSize: 20,
    color: Colors.maroon,
  },
});

export default ProfileScreen;
