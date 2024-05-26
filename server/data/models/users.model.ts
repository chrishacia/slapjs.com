// Desc: Login model

const Database = require('../database');
const { logger } = require('../../logger');

export default class Users {
    #db;

    // tables
    #login_table = 'login';

    #user_info = 'user_information';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection() {
        await this.#db.close();
    }

    async getUserExistsByEmail(email: string): Promise<boolean> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} WHERE email = ? limit 1`;
            const results = await this.#db.query(sql, [email]);
            if (results.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserExistsById(id: number): Promise<boolean> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} WHERE id = ? limit 1`;
            const results = await this.#db.query(sql, [id]);
            if (results.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserInformationById(id: number): Promise<any[]> {
        try {
            const sql = `SELECT * FROM ${this.#user_info} WHERE user_id = ? limit 1`;
            const results = await this.#db.query(sql, [id]);
            if (results.length > 0) {
                return results[0];
            }
            return [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserInformationByEmail(email: string): Promise<any[]> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} l JOIN ${this.#user_info} u on l.id = u.user_id WHERE l.email = ? limit 1`;
            const results = await this.#db.query(sql, [email]);
            if (results.length > 0) {
                return results[0];
            }
            return [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserIdByEmail(email: string): Promise<number> {
        try {
            const sql = `SELECT id FROM ${this.#login_table} WHERE email = ? limit 1`;
            const results = await this.#db.query(sql, [email]);
            return results[0].id || 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserEmailById(id: number): Promise<string> {
        try {
            const sql = `SELECT email FROM ${this.#login_table} WHERE id = ? limit 1`;
            const results = await this.#db.query(sql, [id]);
            return results[0].email || '';
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createUserInformation(
        data: {
            id: number;
            name: string;
            profile_img: string;
            dob: string;
        }): Promise<any[]> {
        try {
            const sql = `INSERT INTO ${this.#user_info} (user_id, name, profile_img, dob)`;
            const values = `VALUES ('${data.id}', '${data.name}', '${data.profile_img}', ${data.dob})`;
            const results = await this.#db.query(sql + values);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async updateUserInformation(
        data: {
            userId: number;
            name: string;
            dob: string;
            postalCode: string;

        }): Promise<any[]> {
        try {
            const sql = `UPDATE ${this.#user_info} SET name = ?, dob = ?, postalCode = ? WHERE user_id = ${data.userId}`;
            const results = await this.#db.query(sql, [
                data.name,
                data.dob,
                data.postalCode,
                data.userId,
            ]);

            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async updateUserProfilePic(userId: number, profile_img: string): Promise<boolean> {
        try {
            const sql = `UPDATE ${this.#user_info} SET profile_img = ? WHERE user_id = ?`;
            const results = await this.#db.query(sql, [profile_img, userId]);

            return results.affectedRows > 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}
