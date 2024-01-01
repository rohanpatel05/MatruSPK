const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const orderItemController = {
  getOrderItems: asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;

    const conn = await pool.getConnection();
    const orderItems = await conn.query(
      "SELECT * FROM OrderItem WHERE order_id = ?",
      [orderId]
    );

    if (orderItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No order item found for the order!" });
    }

    const orderItemsWithProducts = [];

    for (const orderItem of orderItems) {
      const { orderitem_id, product_id, quantity } = orderItem;

      const product = await conn.query(
        "SELECT product_id, name FROM Product WHERE product_id = ?",
        [product_id]
      );

      if (product.length > 0) {
        const orderItemWithProduct = {
          orderitem_id: orderitem_id,
          quantity: quantity,
          product: product[0],
        };

        orderItemsWithProducts.push(orderItemWithProduct);
      }
    }

    conn.release();

    return res.status(200).json(orderItemsWithProducts);
  }),
};

module.exports = orderItemController;
