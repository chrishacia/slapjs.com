const mysql = require('mysql2');
const logger = require('../logger');

require('dotenv').config();

class Database {
  #connection;

  constructor() {
    this.#connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, args, (err, rows) => {
        if (err) {
          this.handleQueryErr(err);
          return reject(err);
        }
        resolve(rows);
        return null;
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.#connection.end((err) => {
        if (err) {
          this.handleQueryErr(err);
          return reject(err);
        }
        resolve();
        return null;
      });
    });
  }

  conn() { return this.#connection; }

  static handleQueryErr(err) {
    let sqlErr = { code: 'DB_ERROR' };
    if (process.env.NODE_ENV === 'development') {
      // suppresed in production enviroment
      sqlErr = {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        index: err.index,
        sql: err.sql,
      };
      logger.log(sqlErr);
    }
    return sqlErr;
  }
}

module.exports = Database;
