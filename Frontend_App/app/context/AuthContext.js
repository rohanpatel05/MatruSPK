import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../config/URL.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(false);
  const [signInErrorExist, setSignInErrorExist] = useState(false);
  const [signInErrorMessage, setSignInErrorMessage] = useState(null);
  const [signUpErrorExist, setSignUpErrorExist] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState(null);
  const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;
  const nameRegex = /^[a-zA-Z'-]+$/;
  const phoneRegex = /^\d{10}$/;

  const register = (firstName, lastName, phoneNumber, email, password) => {
    const userFirstName = String(firstName).trim();
    const userLastName = String(lastName).trim();
    const userPhoneNumber = String(phoneNumber).trim();
    const userEmail = String(email).trim().toLowerCase();
    const userPassword = password;
    setIsLoading(true);

    setSignUpErrorExist(false);
    setSignUpErrorMessage(null);

    if (!nameRegex.test(userFirstName)) {
      setSignUpErrorExist(true);
      setSignUpErrorMessage("Invalid first name format!");
      setIsLoading(false);
      return;
    }

    if (!nameRegex.test(userLastName)) {
      setSignUpErrorExist(true);
      setSignUpErrorMessage("Invalid last name format!");
      setIsLoading(false);
      return;
    }

    if (!phoneRegex.test(userPhoneNumber)) {
      setSignUpErrorExist(true);
      setSignUpErrorMessage("Invalid phone number format!");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(userEmail)) {
      setSignUpErrorExist(true);
      setSignUpErrorMessage("Invalid email format!");
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(userPassword)) {
      setSignUpErrorExist(true);
      setSignUpErrorMessage(
        "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters."
      );
      setIsLoading(false);
      return;
    }

    axios
      .post(`${BASE_URL}/users/registerUser`, {
        first_name: userFirstName,
        last_name: userLastName,
        email: userEmail,
        password: userPassword,
        phone_number: userPhoneNumber,
      })
      .then((res) => {
        let userInfo = res.data;
        setUserInfo(userInfo);
        AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
        setIsAdminLoggedIn(false);
        setIsStaffLoggedIn(false);
        setIsUserLoggedIn(true);
        setIsLoading(false);
      })
      .catch((e) => {
        setSignUpErrorExist(true);
        if (e.response) {
          const errMess = e.response.data.message;
          setSignUpErrorMessage(`${errMess}`);
        } else if (e.request) {
          setSignUpErrorMessage(
            "Network error! Please check your internet connection."
          );
        } else {
          setSignUpErrorMessage("Service error!");
        }
        setIsLoading(false);
      });
  };

  const login = (email, password) => {
    setIsLoading(true);
    const userEmail = String(email).trim().toLowerCase();

    setSignInErrorExist(false);
    setSignInErrorMessage(null);

    if (!emailRegex.test(userEmail)) {
      setSignInErrorExist(true);
      setSignInErrorMessage("Invalid email format!");
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setSignInErrorExist(true);
      setSignInErrorMessage(
        "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters."
      );
      setIsLoading(false);
      return;
    }

    axios
      .post(`${BASE_URL}/users/login`, {
        email: userEmail,
        password: password,
      })
      .then((res) => {
        let userInfo = res.data;
        setUserInfo(userInfo);
        AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
        if (userInfo.user.is_admin === 1 || userInfo.user.is_admin === true) {
          setIsAdminLoggedIn(true);
          setIsStaffLoggedIn(false);
          setIsUserLoggedIn(false);
        } else if (
          userInfo.user.is_staff === 1 ||
          userInfo.user.is_staff === true
        ) {
          setIsAdminLoggedIn(false);
          setIsStaffLoggedIn(true);
          setIsUserLoggedIn(false);
        } else {
          setIsAdminLoggedIn(false);
          setIsStaffLoggedIn(false);
          setIsUserLoggedIn(true);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        setSignInErrorExist(true);
        if (e.response) {
          const errMess = e.response.data.message;
          setSignInErrorMessage(`${errMess}`);
        } else if (e.request) {
          setSignInErrorMessage(
            "Network error! Please check your internet connection."
          );
        } else {
          setSignInErrorMessage("Service error!");
        }
        setIsLoading(false);
      });
  };

  const logout = () => {
    setIsLoading(true);
    AsyncStorage.removeItem("userInfo");
    setUserInfo(null);
    setIsUserLoggedIn(false);
    setIsAdminLoggedIn(false);
    setIsStaffLoggedIn(false);
    setIsLoading(false);
  };

  const handleRefreshToken = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("userInfo");

      if (!storedUserInfo) {
        throw new Error("No user info found!");
      }

      const userInfo = JSON.parse(storedUserInfo);
      const refreshToken = userInfo.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token found!");
      }

      const response = await axios.post(`${BASE_URL}/users/refresh`, {
        refreshToken: refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      const newAccessTokenExpiration = response.data.accessTokenExpiration;
      userInfo.accessToken = newAccessToken;
      userInfo.accessTokenExpiration = newAccessTokenExpiration;
      await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
      setUserInfo(userInfo);
      if (userInfo.user.is_admin === 1 || userInfo.user.is_admin === true) {
        setIsAdminLoggedIn(true);
        setIsStaffLoggedIn(false);
        setIsUserLoggedIn(false);
      } else if (
        userInfo.user.is_staff === 1 ||
        userInfo.user.is_staff === true
      ) {
        setIsAdminLoggedIn(false);
        setIsStaffLoggedIn(true);
        setIsUserLoggedIn(false);
      } else {
        setIsAdminLoggedIn(false);
        setIsStaffLoggedIn(false);
        setIsUserLoggedIn(true);
      }
      return true;
    } catch (e) {
      console.error(`Token refresh error ${e}`);
      logout();
      return false;
    }
  };

  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);
      const storedUserInfo = await AsyncStorage.getItem("userInfo");
      const userInfo = JSON.parse(storedUserInfo);
      if (userInfo) {
        setUserInfo(userInfo);
        if (userInfo.user.is_admin === 1 || userInfo.user.is_admin === true) {
          setIsAdminLoggedIn(true);
          setIsStaffLoggedIn(false);
          setIsUserLoggedIn(false);
        } else if (
          userInfo.user.is_staff === 1 ||
          userInfo.user.is_staff === true
        ) {
          setIsAdminLoggedIn(false);
          setIsStaffLoggedIn(true);
          setIsUserLoggedIn(false);
        } else {
          setIsAdminLoggedIn(false);
          setIsStaffLoggedIn(false);
          setIsUserLoggedIn(true);
        }
      }
      setSplashLoading(false);
    } catch (e) {
      setSplashLoading(false);
      console.error(`is logged in error ${e}`);
    }
  };

  const checkAccessTokenExpiration = async () => {
    if (userInfo) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (
        userInfo.accessTokenExpiration &&
        userInfo.accessTokenExpiration < currentTime
      ) {
        try {
          await handleRefreshToken();
        } catch (e) {
          console.error(`Access token refresh failed ${e}`);
        }
      }
    }
  };

  const checkRefreshTokenExpiration = () => {
    if (userInfo) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (
        userInfo.refreshTokenExpiration &&
        userInfo.refreshTokenExpiration < currentTime
      ) {
        logout();
      }
    }
  };

  useEffect(() => {
    isLoggedIn();
    checkAccessTokenExpiration();
    checkRefreshTokenExpiration();

    const tokenExpirationInterval = setInterval(() => {
      checkAccessTokenExpiration();
      checkRefreshTokenExpiration();
    }, 60000);

    return () => {
      clearInterval(tokenExpirationInterval);
    };
  }, [isAdminLoggedIn, isStaffLoggedIn, isUserLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        isUserLoggedIn,
        isStaffLoggedIn,
        isAdminLoggedIn,
        splashLoading,
        signInErrorExist,
        signUpErrorExist,
        signInErrorMessage,
        signUpErrorMessage,
        setUserInfo,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
