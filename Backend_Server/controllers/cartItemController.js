const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const numRegex = /^[0-9]+$/;

const cartItemController = {
  getCartItems: asyncHandler(async (req, res) => {
    const cartID = req.params.cartID;

    const conn = await pool.getConnection();
    const cartItems = await conn.query(
      "SELECT * FROM CartItem WHERE cart_id = ?",
      [cartID]
    );

    if (cartItems.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Cart empty!" });
    }

    const cartItemsWithProducts = [];

    for (const cartItem of cartItems) {
      const { product_id, cartitem_id, quantity } = cartItem;

      const product = await conn.query(
        "SELECT product_id, name, price, image_url, hidden FROM Product WHERE product_id = ?",
        [product_id]
      );

      if (product.length > 0) {
        if (product[0].hidden === 1) {
          await conn.query("DELETE FROM CrtItem WHERE cartitem_id = ?", [
            cartitem_id,
          ]);
        } else {
          const cartItemWithProduct = {
            cartitem_id: cartitem_id,
            quantity: quantity,
            product: product[0],
          };

          cartItemsWithProducts.push(cartItemWithProduct);
        }
      }
    }
    conn.release();

    return res.status(200).json(cartItemsWithProducts);
  }),

  addItemToCart: asyncHandler(async (req, res) => {
    const cartID = req.params.cartID;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!numRegex.test(product_id) || product_id < 0) {
      return res.status(400).json({ message: "Inavlid product_id value!" });
    }

    if (!numRegex.test(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity value!" });
    }

    const conn = await pool.getConnection();

    const productQTYAvailable = await conn.query(
      "SELECT quantity_available FROM Product WHERE product_id = ? AND hidden = 0",
      [product_id]
    );

    if (productQTYAvailable.length === 0) {
      conn.release();
      return res.status(400).json({
        message: `Product with ID ${product_id} does not exist.`,
      });
    }

    const rows = await conn.query(
      "SELECT * FROM CartItem WHERE cart_id = ? AND product_id = ?",
      [cartID, product_id]
    );

    const qtyAvailable = productQTYAvailable[0].quantity_available;

    if (rows.length > 0) {
      const currentQTY = rows[0].quantity;
      const newQuantity = currentQTY + quantity;

      if (qtyAvailable < newQuantity) {
        await conn.query(
          "UPDATE CartItem SET quantity = ? WHERE cart_id = ? AND product_id = ?",
          [qtyAvailable, cartID, product_id]
        );

        conn.release();
        return res.status(400).json({
          message: "Reached the max quantity available of the product.",
        });
      }

      await conn.query(
        "UPDATE CartItem SET quantity = ? WHERE cart_id = ? AND product_id = ?",
        [newQuantity, cartID, product_id]
      );
    } else {
      if (qtyAvailable < quantity) {
        conn.release();
        return res.status(400).json({
          message: "Item out of stock.",
        });
      }

      await conn.query(
        "INSERT INTO CartItem (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartID, product_id, quantity]
      );
    }

    conn.release();

    return res.status(201).json({ message: "Item added to cart!" });
  }),

  incrementCartItemQTY: asyncHandler(async (req, res) => {
    const cartItemID = req.params.cartItemID;

    const conn = await pool.getConnection();

    const currentQTYRow = await conn.query(
      "SELECT quantity FROM CartItem WHERE cartitem_id = ?",
      [cartItemID]
    );

    if (currentQTYRow.length === 0) {
      conn.release();
      return res.status(400).json({ message: "No cartitem found!" });
    }

    const productQTYAvailable = await conn.query(
      "SELECT quantity_available FROM Product WHERE hidden = 0 AND product_id = (SELECT product_id FROM CartItem WHERE cartitem_id = ?)",
      [cartItemID]
    );

    if (productQTYAvailable.length === 0) {
      await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
        cartItemID,
      ]);

      conn.release();
      return res.status(405).json({
        message: "Product does not exist.",
      });
    }

    const currentQTY = currentQTYRow[0].quantity;
    const newQuantity = currentQTY + 1;
    const qtyAvailable = productQTYAvailable[0].quantity_available;

    if (qtyAvailable < newQuantity) {
      if (qtyAvailable === 0) {
        await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
          cartItemID,
        ]);

        conn.release();
        return res.status(405).json({
          message: "Product out of stock.",
        });
      } else {
        await conn.query(
          "UPDATE CartItem SET quantity = ? WHERE cartitem_id = ?",
          [qtyAvailable, cartItemID]
        );

        conn.release();
        return res.status(405).json({
          message: "Reached the max quantity available of the product.",
        });
      }
    }

    await conn.query("UPDATE CartItem SET quantity = ? WHERE cartitem_id = ?", [
      newQuantity,
      cartItemID,
    ]);

    conn.release();
    return res.status(200).json({
      message: "Cart item quantity incremented successfully!",
    });
  }),

  decrementCartItemQTY: asyncHandler(async (req, res) => {
    const cartItemID = req.params.cartItemID;

    const conn = await pool.getConnection();

    const currentQTYRow = await conn.query(
      "SELECT quantity FROM CartItem WHERE cartitem_id = ?",
      [cartItemID]
    );

    if (currentQTYRow.length === 0) {
      conn.release();
      return res.status(400).json({ message: "No cartitem found!" });
    }

    const productQTYAvailable = await conn.query(
      "SELECT quantity_available FROM Product WHERE hidden = 0 AND product_id = (SELECT product_id FROM CartItem WHERE cartitem_id = ?)",
      [cartItemID]
    );

    if (productQTYAvailable.length === 0) {
      await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
        cartItemID,
      ]);

      conn.release();
      return res.status(405).json({
        message: "Product does not exist.",
      });
    }

    const currentQTY = currentQTYRow[0].quantity;
    const newQuantity = Math.max(currentQTY - 1, 0);
    const qtyAvailable = productQTYAvailable[0].quantity_available;

    if (newQuantity === 0) {
      await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
        cartItemID,
      ]);

      conn.release();
      return res.status(405).json({
        message: "Cart item removed from the cart.",
      });
    }

    if (qtyAvailable < newQuantity) {
      if (qtyAvailable === 0) {
        await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
          cartItemID,
        ]);

        conn.release();
        return res.status(405).json({
          message: "Product out of stock.",
        });
      } else {
        await conn.query(
          "UPDATE CartItem SET quantity = ? WHERE cartitem_id = ?",
          [qtyAvailable, cartItemID]
        );

        conn.release();
        return res.status(405).json({
          message: "Reached the max quantity available of the product.",
        });
      }
    }

    await conn.query("UPDATE CartItem SET quantity = ? WHERE cartitem_id = ?", [
      newQuantity,
      cartItemID,
    ]);

    conn.release();
    return res.status(200).json({
      message: "Cart item quantity decremented successfully!",
    });
  }),

  deleteCartItem: asyncHandler(async (req, res) => {
    const cartItemID = req.params.cartItemID;

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM CartItem WHERE cartitem_id = ?",
      [cartItemID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Cart item not found!" });
    }

    await conn.query("DELETE FROM CartItem WHERE cartitem_id = ?", [
      cartItemID,
    ]);

    conn.release();
    return res.status(200).json({ message: "Cart item deleted successfully!" });
  }),
};

module.exports = cartItemController;
