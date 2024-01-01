const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const cartController = {
  clearCart: asyncHandler(async (req, res) => {
    const cartID = req.params.cartID;

    const conn = await pool.getConnection();

    const rows = await conn.query("SELECT * FROM Cart WHERE cart_id = ?", [
      cartID,
    ]);

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Cart not found for the user!" });
    }

    await conn.query("DELETE FROM CartItem WHERE cart_id = ?", [cartID]);
    conn.release();

    return res.status(200).json({ message: "Cart cleared successfully!" });
  }),
};

module.exports = cartController;
