const pool = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const accessTokenExpiry = "15m";
const refreshTokenExpiry = "7d";
const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
const nameRegex = /^[a-zA-Z'-]+$/;
const phoneRegex = /^\d{10}$/;
const addressRegex = /^[a-zA-Z0-9\s.,<>' -]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

const jwtSecret = process.env.JWT_SECRET;

const userController = {
  getAllStaff: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT first_name, last_name, email FROM User where is_staff = 1"
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No staff found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getUserByEmail: asyncHandler(async (req, res) => {
    const rows = res.locals.user;
    return res.status(200).json(rows[0]);
  }),

  createUser: asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;

    if (!first_name || !last_name || !email || !password || !phone_number) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: "Invalid phone number format!" });
    }

    if (!nameRegex.test(last_name)) {
      return res.status(400).json({ message: "Invalid last name format!" });
    }

    if (!nameRegex.test(first_name)) {
      return res.status(400).json({ message: "Invalid first name format!" });
    }

    const conn = await pool.getConnection();
    const UAE = await conn.query("SELECT * FROM User WHERE email = ?", [email]);

    if (UAE.length > 0) {
      conn.release();
      return res.status(400).json({ message: "User already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await conn.query(
      "INSERT INTO User (first_name, last_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, phone_number]
    );

    await conn.query("INSERT INTO Cart (user_email) VALUES (?)", [email]);

    const userE = await conn.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);

    const userCart = await conn.query(
      "SELECT * FROM Cart WHERE user_email = ?",
      [email]
    );
    conn.release();

    if (userE) {
      const user = {
        first_name: userE[0].first_name,
        last_name: userE[0].last_name,
        email: userE[0].email,
        is_admin: userE[0].is_admin,
        is_staff: userE[0].is_staff,
      };

      const accessToken = jwt.sign(
        { email: user.email, isAdmin: user.is_admin, isStaff: user.is_staff },
        jwtSecret,
        { expiresIn: accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        { email: user.email, isAdmin: user.is_admin, isStaff: user.is_staff },
        jwtSecret,
        { expiresIn: refreshTokenExpiry }
      );

      const accessTokenExpiryInSeconds = 15 * 60;
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
      const accessTokenExpiration =
        currentTimestampInSeconds + accessTokenExpiryInSeconds;

      const refreshTokenExpiryInSeconds = 7 * 24 * 60 * 60;
      const refreshTokenExpiration =
        currentTimestampInSeconds + refreshTokenExpiryInSeconds;

      return res.status(201).json({
        accessToken: accessToken,
        accessTokenExpiration: accessTokenExpiration,
        refreshToken: refreshToken,
        refreshTokenExpiration: refreshTokenExpiration,
        user: user,
        cart: userCart[0],
      });
    } else {
      return res.status(500).json({ message: "Error registering account!" });
    }
  }),

  createStaff: asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    if (!nameRegex.test(last_name)) {
      return res.status(400).json({ message: "Invalid last name format!" });
    }

    if (!nameRegex.test(first_name)) {
      return res.status(400).json({ message: "Invalid first name format!" });
    }

    const conn = await pool.getConnection();
    const UAE = await conn.query("SELECT * FROM User WHERE email = ?", [email]);

    if (UAE.length > 0) {
      conn.release();
      return res
        .status(400)
        .json({ message: "Staff user already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const is_staff = 1;
    await conn.query(
      "INSERT INTO User (first_name, last_name, email, password, is_staff) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, is_staff]
    );
    conn.release();

    return res.status(201).json({ message: "Staff created successfully!" });
  }),

  createAdmin: asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;

    if (!first_name || !last_name || !email || !password || !phone_number) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: "Invalid phone number format!" });
    }

    if (!nameRegex.test(last_name)) {
      return res.status(400).json({ message: "Invalid last name format!" });
    }

    if (!nameRegex.test(first_name)) {
      return res.status(400).json({ message: "Invalid first name format!" });
    }

    const conn = await pool.getConnection();
    const UAE = await conn.query("SELECT * FROM User WHERE email = ?", [email]);

    if (UAE.length > 0) {
      conn.release();
      return res
        .status(400)
        .json({ message: "Admin user already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const is_staff = 0;
    const is_admin = 1;
    await conn.query(
      "INSERT INTO User (first_name, last_name, email, password, phone_number, is_admin, is_staff) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        phone_number,
        is_admin,
        is_staff,
      ]
    );
    conn.release();

    return res.status(201).json({ message: "Admin created successfully!" });
  }),

  logIn: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password!" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    const conn = await pool.getConnection();
    const UAE = await conn.query("SELECT * FROM User WHERE email = ?", [email]);
    const userCart = await conn.query(
      "SELECT * FROM Cart WHERE user_email = ?",
      [email]
    );

    conn.release();

    if (UAE.length === 0) {
      return res.status(404).json({ message: "User not registered!" });
    }

    const isMatch = await bcrypt.compare(password, UAE[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong Password!" });
    }

    const user = {
      first_name: UAE[0].first_name,
      last_name: UAE[0].last_name,
      email: UAE[0].email,
      is_admin: UAE[0].is_admin,
      is_staff: UAE[0].is_staff,
    };

    const accessToken = jwt.sign(
      { email: user.email, isAdmin: user.is_admin, isStaff: user.is_staff },
      jwtSecret,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { email: user.email, isAdmin: user.is_admin, isStaff: user.is_staff },
      jwtSecret,
      { expiresIn: refreshTokenExpiry }
    );

    const accessTokenExpiryInSeconds = 15 * 60;
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const accessTokenExpiration =
      currentTimestampInSeconds + accessTokenExpiryInSeconds;

    const refreshTokenExpiryInSeconds = 7 * 24 * 60 * 60;
    const refreshTokenExpiration =
      currentTimestampInSeconds + refreshTokenExpiryInSeconds;

    return res.status(200).json({
      accessToken: accessToken,
      accessTokenExpiration: accessTokenExpiration,
      refreshToken: refreshToken,
      refreshTokenExpiration: refreshTokenExpiration,
      user: user,
      cart: userCart[0],
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token!" });
    }

    jwt.verify(refreshToken, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token!" });
      }

      const email = decoded.email;
      const is_admin = decoded.isAdmin;
      const is_staff = decoded.isStaff;

      const accessToken = jwt.sign(
        { email: email, isAdmin: is_admin, isStaff: is_staff },
        jwtSecret,
        {
          expiresIn: accessTokenExpiry,
        }
      );

      const accessTokenExpiryInSeconds = 15 * 60;
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
      const accessTokenExpiration =
        currentTimestampInSeconds + accessTokenExpiryInSeconds;

      return res.status(200).json({
        accessToken: accessToken,
        accessTokenExpiration: accessTokenExpiration,
        message: "Successful refresh!",
      });
    });
  }),

  updateUserInfo: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || !last_name || !phone_number) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: "Invalid phone number format!" });
    }

    if (!nameRegex.test(last_name)) {
      return res.status(400).json({ message: "Invalid last name format!" });
    }

    if (!nameRegex.test(first_name)) {
      return res.status(400).json({ message: "Invalid first name format!" });
    }

    const conn = await pool.getConnection();

    await conn.query(
      "UPDATE User SET first_name = ?, last_name = ?, phone_number = ? WHERE email = ?",
      [first_name, last_name, phone_number, userEmail]
    );
    conn.release();

    return res.status(200).json({ message: "User info updated successfully!" });
  }),

  updateEmail: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing new email!" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    const conn = await pool.getConnection();

    await conn.query("UPDATE User SET email = ? WHERE email = ?", [
      email,
      userEmail,
    ]);

    conn.release();

    return res
      .status(200)
      .json({ message: "User email updated successfully!" });
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;
    const { oldPassword, password } = req.body;
    const users = res.locals.user;

    if (!oldPassword || !password) {
      return res
        .status(400)
        .json({ message: "Missing password field value(s)!" });
    }

    if (!passwordRegex.test(oldPassword) || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain: \n\u2022 At least 1 uppercase letter \n\u2022 At least 1 lowercase letter \n\u2022 At least 1 digit\n\u2022 At least 1 special character \n\u2022 8-16 characters.",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, users[0].password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();

    await conn.query("UPDATE User SET password = ? WHERE email = ?", [
      hashedPassword,
      userEmail,
    ]);
    conn.release();

    return res.status(200).json({ message: "Password updated successfully!" });
  }),

  updateAddress: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Missing address field value!" });
    }

    if (!addressRegex.test(address)) {
      return res.status(400).json({ message: "Invalid address!" });
    }

    const conn = await pool.getConnection();

    await conn.query("UPDATE User SET address = ? WHERE email = ?", [
      address,
      userEmail,
    ]);

    conn.release();

    return res
      .json(200)
      .json({ message: "User address updated successfully!" });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;
    const conn = await pool.getConnection();

    await conn.query(
      "DELETE FROM Payment where order_id IN (SELECT order_id FROM `Order` WHERE user_email = ?)",
      [userEmail]
    );
    await conn.query(
      "DELETE FROM OrderItem where order_id IN (SELECT order_id FROM `Order` WHERE user_email = ?)",
      [userEmail]
    );
    await conn.query(
      "DELETE FROM CartItem where cart_id IN (SELECT cart_id FROM Cart WHERE user_email = ?)",
      [userEmail]
    );
    await conn.query("DELETE FROM Cart WHERE user_email = ?", [userEmail]);
    await conn.query("DELETE FROM `Order` WHERE user_email = ?", [userEmail]);
    await conn.query("DELETE FROM User WHERE email = ?", [userEmail]);
    conn.release();

    return res.status(200).json({ message: "User deleted successfully!" });
  }),
};

module.exports = userController;
