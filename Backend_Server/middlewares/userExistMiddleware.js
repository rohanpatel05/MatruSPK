const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const userExistMiddleware = asyncHandler(async (req, res, next) => {
  const userEmail = req.params.userEmail;
  const conn = await pool.getConnection();
  const rows = await conn.query(`SELECT * FROM User WHERE email = ?`, [
    userEmail,
  ]);
  conn.release();
  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found." });
  } else {
    res.locals.user = rows;
    next();
  }
});

module.exports = userExistMiddleware;
