const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");

const priceRegex = /^(?!0\.00)(?:\d+)(?:\.\d{2})?$/;
const nameRegex = /^[a-zA-Z' -()]+$/;
const numRegex = /^[0-9]+$/;
const booleanRegex = /^[0-1]+$/;

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const productController = {
  getAllProduct: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT product_id, name, quantity_available FROM Product"
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No product found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getNonHiddenProduct: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT category_id, product_id, name, price, image_url FROM Product where hidden = 0"
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No non hidden product found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  getProductById: asyncHandler(async (req, res) => {
    const productID = req.params.productID;
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM Product WHERE product_id = ?",
      [productID]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No product found by id!" });
    } else {
      return res.status(200).json(rows[0]);
    }
  }),

  searchProduct: asyncHandler(async (req, res) => {
    const searchQuery = req.params.searchQuery;

    const conn = await pool.getConnection();
    const rows = await conn.query(
      " SELECT * FROM Product WHERE name LIKE ? or description LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No product found!" });
    }

    return res.status(200).json(rows);
  }),

  createProduct: asyncHandler(async (req, res) => {
    const { name, description, price, category_id, quantity_available } =
      req.body;

    const image = req.file;

    if (
      !name ||
      !description ||
      !price ||
      !category_id ||
      !quantity_available
    ) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid name format!" });
    }

    if (!priceRegex.test(price)) {
      return res.status(400).json({ message: "Inavlid price format!" });
    }

    if (!numRegex.test(quantity_available) || quantity_available < 0) {
      return res.status(400).json({ message: "Invalid quantity available." });
    }

    if (!numRegex.test(category_id)) {
      return res.status(400).json({ message: "Inavlid category_id format!" });
    }

    if (!image) {
      return res.status(400).json({ message: "Missing image file!" });
    }

    const conn = await pool.getConnection();

    const categoryRow = await conn.query(
      "SELECT * FROM Category WHERE category_id = ?",
      [category_id]
    );

    if (categoryRow.length === 0) {
      conn.release();
      return res
        .status(400)
        .json({ message: "Invalid category id! No category found." });
    }

    const imageType = image.mimetype;
    const parts = imageType.split("/");
    const extension = parts[1];

    const fileName = `images/${name}.${extension}`;

    const putObjectParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: image.buffer,
      ContentType: imageType,
    };

    const putCommand = new PutObjectCommand(putObjectParams);
    await s3.send(putCommand);

    const sanitizedObjectKey = fileName.replace(/ /g, "+");
    const ObjectUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${sanitizedObjectKey}`;

    await conn.query(
      "INSERT INTO Product (name, description, price, category_id, quantity_available, image_url, file_key) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        price,
        category_id,
        quantity_available,
        ObjectUrl,
        fileName,
      ]
    );
    conn.release();

    return res.status(201).json({ message: "Product created successfully!" });
  }),

  updateProductInfo: asyncHandler(async (req, res) => {
    const productID = req.params.productID;
    const {
      name,
      description,
      price,
      category_id,
      quantity_available,
      hidden,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !category_id ||
      !quantity_available ||
      !hidden
    ) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid name format!" });
    }

    if (!priceRegex.test(price)) {
      return res.status(400).json({ message: "Inavlid price format!" });
    }

    if (!numRegex.test(category_id)) {
      return res.status(400).json({ message: "Inavlid category_id format!" });
    }

    if (!numRegex.test(quantity_available) || quantity_available < 0) {
      return res.status(400).json({ message: "Invalid quantity available." });
    }

    if (!booleanRegex.test(hidden)) {
      return res.status(400).json({ message: "Invalid hidden value!" });
    }

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM Product WHERE product_id = ?",
      [productID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "The product does not exist!" });
    }

    const categoryRow = await conn.query(
      "SELECT * FROM Category WHERE category_id = ?",
      [category_id]
    );

    if (categoryRow.length === 0) {
      conn.release();
      return res
        .status(400)
        .json({ message: "Invalid category id! No category found." });
    }

    const resp = await conn.query(
      "UPDATE Product SET name = ?, description = ?, price = ?, category_id = ?, quantity_available = ?, hidden = ? WHERE product_id = ?",
      [
        name,
        description,
        price,
        category_id,
        quantity_available,
        hidden,
        productID,
      ]
    );
    conn.release();

    return res
      .status(200)
      .json({ message: "Product info updated successfully!" });
  }),

  updateQTY: asyncHandler(async (req, res) => {
    const productID = req.params.productID;
    const { quantity_available } = req.body;

    if (!quantity_available) {
      return res.status(400).json({ message: "Missing quiantity amount!" });
    }

    if (!numRegex.test(quantity_available) || quantity_available < 0) {
      return res.status(400).json({ message: "Invalid quantity available." });
    }

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM Product WHERE product_id = ?",
      [productID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "The product does not exist!" });
    }

    await conn.query(
      "UPDATE Product SET quantity_available = ? WHERE product_id = ?",
      [quantity_available, productID]
    );
    conn.release();

    return res
      .status(200)
      .json({ message: "Product qty. updated successfully!" });
  }),

  updateProductImage: asyncHandler(async (req, res) => {
    const { productName } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Missing image file!" });
    }

    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM Product WHERE name = ?", [
      productName,
    ]);

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "The product does not exist!" });
    }

    const imageType = image.mimetype;
    const parts = imageType.split("/");
    const extension = parts[1];

    const fileName = `images/${productName}.${extension}`;

    const putObjectParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: image.buffer,
      ContentType: imageType,
    };

    const putCommand = new PutObjectCommand(putObjectParams);
    await s3.send(putCommand);

    const sanitizedObjectKey = fileName.replace(/ /g, "+");
    const ObjectUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${sanitizedObjectKey}`;
    const product_id = rows[0].product_id;

    await conn.query(
      "UPDATE Product SET image_url = ?, file_key = ? WHERE product_id = ?",
      [ObjectUrl, fileName, product_id]
    );
    conn.release();

    return res
      .status(200)
      .json({ message: "Product image updated successfully!" });
  }),

  deleteProduct: asyncHandler(async (req, res) => {
    const productID = req.params.productID;
    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM Product WHERE product_id = ?",
      [productID]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "No product found by id!" });
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: rows[0].file_key,
    };

    const deletCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deletCommand);

    await conn.query("DELETE FROM CartItem WHERE product_id = ?", [productID]);
    await conn.query("DELETE FROM OrderItem WHERE product_id = ?", [productID]);
    await conn.query("DELETE FROM Product WHERE product_id = ?", [productID]);

    conn.release();

    return res.status(200).json({ message: "Product deleted successfully!" });
  }),
};

module.exports = productController;
