const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
const priceRegex = /^(?!0\.00)(?:\d+)(?:\.\d{2})?$/;
const addressRegex = /^[a-zA-Z0-9\s.,<>' -]+$/;

const orderController = {
  getUserOrders: asyncHandler(async (req, res) => {
    const userEmail = req.params.userEmail;

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM `Order` WHERE user_email = ? ORDER BY order_id DESC",
      [userEmail]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No order found by user email!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getOrdersByStatus: asyncHandler(async (req, res) => {
    const status = req.params.status;

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM `Order` WHERE status = ? ORDER BY order_id DESC",
      [status]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No order found by status!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  proceedToPayment: asyncHandler(async (req, res) => {
    const cartID = req.params.cartID;
    const conn = await pool.getConnection();

    const cartItems = await conn.query(
      "SELECT product_id, quantity, cartitem_id FROM CartItem WHERE cart_id = ?",
      [cartID]
    );

    if (cartItems.length === 0) {
      conn.release();
      return res.status(400).json({
        message: "Cannot process to payment screen! The cart is empty.",
      });
    }

    for (const cartItem of cartItems) {
      const { product_id, quantity, cartitem_id } = cartItem;

      const product = await conn.query(
        "SELECT quantity_available FROM Product WHERE product_id = ? AND hidden = 0",
        [product_id]
      );

      if (product.length === 0) {
        await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
          cartitem_id,
        ]);

        conn.release();
        return res.status(405).json({
          message: `Product with ID ${product_id} does not exist.`,
        });
      }

      const qtyAvailable = product[0].quantity_available;

      if (qtyAvailable < quantity) {
        if (qtyAvailable === 0) {
          await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
            cartitem_id,
          ]);

          conn.release();
          return res.status(405).json({
            message: "Some products are sold out.",
          });
        } else {
          await conn.query(
            "UPDATE CartItem SET quantity = ? WHERE cartitem_id = ?",
            [qtyAvailable, cartitem_id]
          );

          conn.release();
          return res.status(405).json({
            message:
              "Some products are no longer available in desired quantity.",
          });
        }
      }
    }

    conn.release();
    return res.status(200).json({ message: "Can proceed to payment screen!" });
  }),

  createOrder: asyncHandler(async (req, res) => {
    const { user_email, total_amount, address } = req.body;

    if (!user_email || !total_amount || !address) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!emailRegex.test(user_email)) {
      return res.status(400).json({ message: "Invalid email value!" });
    }

    if (!priceRegex.test(total_amount)) {
      return res.status(400).json({ message: "Invalid total price value!" });
    }

    if (!addressRegex.test(address)) {
      return res.status(400).json({ message: "Invalid address value format!" });
    }

    let conn;

    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Product availability check.
      const cartItems = await conn.query(
        "SELECT product_id, quantity FROM CartItem WHERE cart_id = (SELECT cart_id FROM Cart WHERE user_email = ?)",
        [user_email]
      );

      if (cartItems.length === 0) {
        conn.release();
        return res
          .status(400)
          .json({ message: "Cannot place order on an empty cart!" });
      }

      for (const cartItem of cartItems) {
        const { product_id, quantity } = cartItem;

        const product = await conn.query(
          "SELECT quantity_available FROM Product WHERE product_id = ? AND hidden = 0",
          [product_id]
        );

        if (product.length === 0) {
          conn.release();
          return res.status(400).json({
            message: `Product with ID ${product_id} does not exist.`,
          });
        }

        if (product[0].quantity_available < quantity) {
          await conn.query(
            "DELETE FROM CartItem WHERE product_id = ? AND cart_id = (SELECT cart_id FROM Cart WHERE user_email = ?)",
            [product_id, user_email]
          );

          conn.release();
          return res.status(400).json({
            message: "Some product is not available in quantity desired.",
            product_id: `Product id: ${product_id}`,
          });
        }
      }

      // Insert order record
      const result = await conn.query(
        "INSERT INTO `Order` (user_email, total_amount, address) VALUES (?, ?, ?)",
        [user_email, total_amount, address]
      );
      const orderId = Number(result.insertId);

      // Move cart item to order item
      await conn.query(
        "INSERT INTO OrderItem (order_id, product_id, quantity) SELECT ?, product_id, quantity FROM CartItem WHERE cart_id = (SELECT cart_id FROM Cart WHERE user_email = ?)",
        [orderId, user_email]
      );

      // Clear cart
      await conn.query(
        "DELETE FROM CartItem WHERE cart_id = (SELECT cart_id FROM Cart WHERE user_email = ?)",
        [user_email]
      );

      const payment_method = "Credit Card";
      // Payment record
      await conn.query(
        "INSERT INTO Payment (order_id, payment_method, amount) VALUES (?, ?, ?)",
        [orderId, payment_method, total_amount]
      );

      for (const cartItem of cartItems) {
        const { product_id, quantity } = cartItem;

        // Product qty update
        await conn.query(
          "UPDATE Product SET quantity_available = quantity_available - ? WHERE product_id = ?",
          [quantity, product_id]
        );
      }

      await conn.commit();
      conn.release();

      return res
        .status(201)
        .json({ message: "Order created successfully!", order_id: orderId });
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }

      if (!res.headersSent) {
        return res.status(500).json({ message: "An error occurred!" });
      }
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }),

  updateOrderStatus: asyncHandler(async (req, res) => {
    const orderID = req.params.orderID;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status field value missing!" });
    }

    if (status > 2 || status < 0) {
      return res.status(400).json({ message: "Invalid status value!" });
    }

    const conn = await pool.getConnection();

    const row = await conn.query("SELECT * FROM `Order` WHERE order_id = ?", [
      orderID,
    ]);

    if (row.length === 0) {
      conn.release();
      return res.status(404).json({ message: "The order does not exist!" });
    }

    await conn.query("UPDATE `Order` SET status = ? WHERE order_id = ?", [
      status,
      orderID,
    ]);

    conn.release();
    return res
      .status(200)
      .json({ message: "Order status updated successfully!" });
  }),
};

module.exports = orderController;
