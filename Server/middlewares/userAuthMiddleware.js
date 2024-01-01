const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const userAuthMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing access token!" });
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Could not verify access token!" });
        } else {
          req.user = decoded;
          next();
        }
      });
    }
  } else {
    res.status(400);
    return res.status(400).json({ message: "Missing request header!" });
  }
});

module.exports = userAuthMiddleware;
