const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const numRegex = /^[0-9]+$/;

const additionalChargesController = {
  getAllCharges: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM AdditionalCharges");
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No additional charges found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  calculateCharges: asyncHandler(async (req, res) => {
    const cartID = req.params.cartID;

    let subtotal = 0.0;
    let taxAmount = 0.0;
    let totalAmount = 0.0;

    const conn = await pool.getConnection();
    const cartItems = await conn.query(
      "SELECT * FROM CartItem WHERE cart_id = ?",
      [cartID]
    );

    if (cartItems.length === 0) {
      conn.release();
      return res
        .status(400)
        .json({ message: "Cannot calculate charges. The cart is empty." });
    }

    for (const cartItem of cartItems) {
      const { product_id, quantity } = cartItem;

      const product = await conn.query(
        "SELECT * FROM Product WHERE product_id = ? AND hidden = 0",
        [product_id]
      );

      if (product.length === 0) {
        conn.release();
        return res.status(400).json({
          message: `Product with ID ${product_id} does not exist.`,
        });
      }

      const productPrice = product[0].price;
      const price = parseFloat(productPrice);
      const priceForProduct = price * quantity;

      subtotal += priceForProduct;
    }

    const charges = await conn.query("SELECT * FROM AdditionalCharges");

    if (charges.length === 0) {
      conn.release();
      return res
        .status(404)
        .json({ message: "Error generating rates! No rate found in db." });
    }

    let taxRate;
    let deliveryFee;
    for (const charge of charges) {
      if (charge.name === "Taxes") {
        taxRate = charge.rate;
      }
      if (charge.name === "Delivery") {
        deliveryFee = charge.rate;
      }
    }

    if (!subtotal || subtotal === 0.0) {
      conn.release();
      return res.status(500).json({ message: "Error generating subtotal!" });
    }

    taxAmount = subtotal * (taxRate / 100);

    if (!taxAmount || taxAmount === 0.0) {
      conn.release();
      return res.status(500).json({ message: "Error generating tax amount!" });
    }

    totalAmount = subtotal + deliveryFee + taxAmount;

    const subtotalTwoDP = subtotal.toFixed(2);
    const deliveryFeeTwoDP = deliveryFee.toFixed(2);
    const taxAmountTwoDP = taxAmount.toFixed(2);
    const totalAmountTwoDP = totalAmount.toFixed(2);

    const responseJson = [
      {
        key: 0,
        name: "Subtotal",
        amount: subtotalTwoDP,
      },
      {
        key: 1,
        name: "Delivery Fees",
        amount: deliveryFeeTwoDP,
      },
      {
        key: 2,
        name: "Fees & Taxes",
        amount: taxAmountTwoDP,
      },
      {
        key: 3,
        name: "Total",
        amount: totalAmountTwoDP,
      },
    ];

    conn.release();
    return res.status(200).json(responseJson);
  }),

  updateACharge: asyncHandler(async (req, res) => {
    const name = req.params.name;
    const { rate } = req.body;

    if (!rate) {
      return res.status(400).json({ message: "Missing rate field value!" });
    }

    if (!numRegex.test(rate)) {
      return res.status(400).json({ message: "Invalid rate value!" });
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM AdditionalCharges WHERE name = ?",
      [name]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Charge does not exist!" });
    }

    await conn.query("UPDATE AdditionalCharges SET rate = ? WHERE name = ?", [
      rate,
      name,
    ]);

    conn.release();

    return res
      .status(200)
      .json({ message: "Charge rate succussfully updated!" });
  }),
};

module.exports = additionalChargesController;
