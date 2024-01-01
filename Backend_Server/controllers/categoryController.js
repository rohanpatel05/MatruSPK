const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const nameRegex = /^[a-zA-Z' -]+$/;
const booleanRegex = /^[0-1]+$/;

const categoryController = {
  getAllCategory: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM Category");
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No category found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getNonHiddenCategory: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM Category where hidden = 0");
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No non hidden category found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  createCategory: asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name value missing!" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid category name value!" });
    }

    const conn = await pool.getConnection();
    await conn.query("INSERT INTO Category (name) VALUES (?)", [name]);
    conn.release();

    return res.status(201).json({ message: "Category created successfully!" });
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const { name, hidden } = req.body;
    const categoryID = req.params.categoryID;

    if (!name || !hidden) {
      return res.status(400).json({ message: "Missing required field value!" });
    }

    if (!booleanRegex.test(hidden)) {
      return res.status(400).json({ message: "Invalid hidden value!" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid category name value!" });
    }

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM Category WHERE category_id = ?",
      [categoryID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "The category does not exist!" });
    }

    await conn.query(
      "UPDATE Category SET name = ?, hidden = ? WHERE category_id = ?",
      [name, hidden, categoryID]
    );
    conn.release();

    return res.status(200).json({ message: "Category updated successfully!" });
  }),

  deleteCategory: asyncHandler(async (req, res) => {
    const categoryID = req.params.categoryID;
    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM Category WHERE category_id = ?",
      [categoryID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Category does not exist!" });
    }

    const catProducts = await conn.query(
      "SELECT * FROM Product WHERE category_id = ?",
      [categoryID]
    );

    if (catProducts.length > 0) {
      conn.release();
      return res.status(400).json({
        message: `Cannot delete ${rows[0].name}. Some products belong to this category.`,
      });
    }

    await conn.query("DELETE FROM Category  WHERE category_id = ?", [
      categoryID,
    ]);
    conn.release();

    return res.status(200).json({ message: "Category deleted successfully!" });
  }),
};

module.exports = categoryController;
