const Database = require('../database');
const logger = require('../../logger');

class Login {
    #db;

    #table = 'login';

    constructor() {
        this.#db = new Database();
    }

    async getPassDetailsForComparison(email) {
        try {
            const sql = `SELECT pass, salt FROM ${this.#table} WHERE email = ? limit 1`;
            const results = await this.#db.query(sql, [email]);
            if (results.length > 0) {
                // User authenticated successfully
                return results;
            }
            // Authentication failed
            return [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createLogin(data) {
        try {
            const sql = `insert into ${this.#table} (create_ts, email, pass, salt, status, verified)`;
            const values = `values ('${data.create_ts}', '${data.email}', '${data.pass}', '${data.salt}', 0, 0)`;
            const results = await this.#db.query(sql + values);
            return results.insertId;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async closeConnection() {
        await this.#db.close();
    }
}

module.exports = Login;
