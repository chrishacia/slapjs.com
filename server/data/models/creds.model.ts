const Database = require('../database');
const logger = require('../../logger');

export default class Creds {
    #db;

    #table_login = 'login';

    #table_verify = 'user_verification';

    constructor() {
        this.#db = new Database();
    }

    async updateUserCredentials(data: {
        pass: string;
        salt: string;
        email: string;
    }): Promise<any[]> {
        try {
            const sql = `UPDATE ${this.#table_login} SET pass = ?, salt = ? WHERE email = ?`;
            const values = [data.pass, data.salt, data.email];
            const results = await this.#db.query(sql, values);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createUserVerification(data: {
        user_id: number;
        issuedAt: string;
        hashy: string;
        vType: string;
    }): Promise<{ id: number; code: string }>{
        try {
            const sql = `INSERT INTO ${this.#table_verify} (user_id, isUsed, issuedAt, hashy, vType) VALUES (?, 0, ?, ?, ?)`;
            const values = [data.user_id, data.issuedAt, data.hashy, data.vType];
            const results = await this.#db.query(sql, values);
            return { id: results.insertId, code: data.hashy };
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async validateUserVerification(data: {
        id: number;
        user_id: string;
        hashy: string;
    }): Promise<any[]> {
        try {
            const sql = `SELECT * FROM ${this.#table_verify} WHERE id = ? AND user_id = ? AND hashy = ? AND isUsed = 0`;
            const values = [data.id, data.user_id, data.hashy];
            const results = await this.#db.query(sql, values);
            if (results.length > 0) {
                return results[0];
            }
            return [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async closeConnection(): Promise<void> {
        await this.#db.close();
    }
}
