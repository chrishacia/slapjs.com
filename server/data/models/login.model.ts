const Database = require('../database');
const logger = require('../../logger');

export default class Login {
    #db;

    #table = 'login';

    constructor() {
        this.#db = new Database();
    }

    async getPassDetailsForComparison(email: string): Promise<any[]> {
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

    async createLogin(data: {
        create_ts: string;
        email: string;
        pass: string;
        salt: string;
    }
    ): Promise<number> {
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

    async closeConnection(): Promise<void> {
        await this.#db.close();
    }
}
