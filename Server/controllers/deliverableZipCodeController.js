const pool = require("../config/db.js");
const asyncHandler = require("express-async-handler");

const zipRegex = /^[0-9]{6}$/;

const deliverableZipCodeController = {
  getAllZips: asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM DeliverableZipCode");
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No zip codes found!" });
    } else {
      return res.status(200).json(rows);
    }
  }),

  isValidAddress: asyncHandler(async (req, res) => {
    const zip = req.params.zip;

    if (!zipRegex.test(zip)) {
      return res.status(400).json({ message: "Invalid zip code value!" });
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM DeliverableZipCode where zipcode = ?",
      [zip]
    );
    conn.release();

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Unfortunatly we do not do delivery in this area." });
    } else {
      return res.status(200).json({ message: "We deliver in this area." });
    }
  }),

  createZip: asyncHandler(async (req, res) => {
    const { zipcode } = req.body;

    if (!zipcode) {
      return res.status(400).json({ message: "Missing zip code field value!" });
    }

    if (!zipRegex.test(zipcode)) {
      return res.status(400).json({ message: "Invalid zip code value!" });
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM DeliverableZipCode WHERE zipcode = ?",
      [zipcode]
    );

    if (rows.length > 0) {
      conn.release();
      return res.status(400).json({ message: "Zip code already exists!" });
    }

    await conn.query("INSERT INTO DeliverableZipCode (zipcode) VALUES (?)", [
      zipcode,
    ]);

    conn.release();

    return res.status(201).json({ message: "Zip code succussfully added!" });
  }),

  deleteZip: asyncHandler(async (req, res) => {
    const zip = req.params.zip;

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM DeliverableZipCode WHERE zipcode = ?",
      [zip]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Zip code not found!" });
    }

    await conn.query("DELETE FROM DeliverableZipCode WHERE zipcode = ?", [zip]);

    conn.release();
    return res.status(200).json({ message: "Zip code deleted successfully!" });
  }),
};

module.exports = deliverableZipCodeController;
