const mysql = require('mysql2');
const { logger } = require('../logger');

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
                    resolve([]);
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
                    resolve();
                    return reject(err);
                }
                resolve();
                return null;
            });
        });
    }

    conn() { return this.#connection; }

    handleQueryErr(err) {
        let sqlErr = { code: 'DB_ERROR' };
        if (process.env.SERVER_ENV === 'development') {
            // suppresed in production enviroment
            sqlErr = {
                code: err.code,
                errno: err.errno,
                sqlMessage: err.sqlMessage,
                sqlState: err.sqlState,
                index: err.index,
                sql: err.sql,
            };
            logger.error(sqlErr);
        }
        return sqlErr;
    }

    debugQuery(sql, args) {
        const query = this.#connection.format(sql, args);
        if (process.env.SERVER_ENV === 'development') {
            console.log('===== DEBUG QUERY MODE =====');
            console.log('===== DEBUG QUERY MODE =====');
            console.log('QUERY:', sql)
            console.log('VALUES:', args);
            console.log('-----------------------------');
            console.log('FORMATTED QUERY:', query);
            console.log('===== DEBUG QUERY MODE =====');
            console.log('===== DEBUG QUERY MODE =====');
            return query;
        }
        return null;
    }
}

module.exports = Database;
