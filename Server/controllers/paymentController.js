const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const priceRegex = /^[1-9]\d*$/;

const paymentController = {
  getAllPayments: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM Payment ORDER BY order_id DESC"
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No payments found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getPaymentByOrder: asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;

    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM Payment WHERE order_id = ?", [
      orderId,
    ]);
    conn.release();

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No payments found by order id!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  createPaymentIntent: asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Missing amount value." });
    }

    if (!priceRegex.test(amount)) {
      return res.status(400).json({ message: "Invalid amount value." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(201).json({ paymentIntent: paymentIntent.client_secret });
  }),
};

module.exports = paymentController;
