const mariadb = require("mariadb");

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPwd = process.env.DB_PWD;
const dbName = process.env.DB_NAME;

const pool = mariadb.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPwd,
  database: dbName,
  connectionLimit: 5,
});

module.exports = pool;
