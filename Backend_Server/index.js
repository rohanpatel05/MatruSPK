const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const cartItemRoutes = require("./routes/cartItemRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const orderItemRoutes = require("./routes/orderItemRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const deliverableZipCodeRoutes = require("./routes/deliverableZipCodeRoutes.js");
const AdditionalChargesRoutes = require("./routes/additionalChargesRoutes.js");
const errorHandler = require("./middlewares/errorHandler.js");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/test", (req, res) => {
  res.send("It's working!");
});

let baseUrl = "/api";
app.use(baseUrl, userRoutes);
app.use(baseUrl, categoryRoutes);
app.use(baseUrl, productRoutes);
app.use(baseUrl, cartRoutes);
app.use(baseUrl, cartItemRoutes);
app.use(baseUrl, orderRoutes);
app.use(baseUrl, orderItemRoutes);
app.use(baseUrl, paymentRoutes);
app.use(baseUrl, deliverableZipCodeRoutes);
app.use(baseUrl, AdditionalChargesRoutes);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
