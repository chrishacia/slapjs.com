import { RowDataPacket, OkPacket } from 'mysql2';
import Database from '../database';
import { logger } from '../../logger';

export default class Users {
    #db: Database;

    // tables
    #login_table = 'login';
    #user_info = 'user_information';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection(): Promise<void> {
        await this.#db.close();
    }

    async getUserExistsByEmail(email: string): Promise<boolean> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} WHERE email = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
            return results.length > 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserExistsById(id: number): Promise<boolean> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} WHERE id = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [id]);
            return results.length > 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserInformationById(id: number): Promise<RowDataPacket[]> {
        try {
            const sql = `SELECT * FROM ${this.#user_info} WHERE user_id = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [id]);
            return results.length > 0 ? results : [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserInformationByEmail(email: string): Promise<RowDataPacket[]> {
        try {
            const sql = `SELECT * FROM ${this.#login_table} l JOIN ${this.#user_info} u ON l.id = u.user_id WHERE l.email = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
            return results.length > 0 ? results : [];
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserIdByEmail(email: string): Promise<number> {
        try {
            const sql = `SELECT id FROM ${this.#login_table} WHERE email = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
            return results.length > 0 ? results[0].id : 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getUserEmailById(id: number): Promise<string> {
        try {
            const sql = `SELECT email FROM ${this.#login_table} WHERE id = ? LIMIT 1`;
            const results = await this.#db.query<RowDataPacket[]>(sql, [id]);
            return results.length > 0 ? results[0].email : '';
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createUserInformation(data: { id: number; name: string; profile_img: string; dob: string }): Promise<OkPacket> {
        try {
            const sql = `INSERT INTO ${this.#user_info} (user_id, name, profile_img, dob) VALUES (?, ?, ?, ?)`;
            const results = await this.#db.query<OkPacket>(sql, [data.id, data.name, data.profile_img, data.dob]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async updateUserInformation(data: { userId: number; name: string; dob: string; postalCode: string }): Promise<OkPacket> {
        try {
            const sql = `UPDATE ${this.#user_info} SET name = ?, dob = ?, postalCode = ? WHERE user_id = ?`;
            const results = await this.#db.query<OkPacket>(sql, [data.name, data.dob, data.postalCode, data.userId]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async updateUserProfilePic(userId: number, profile_img: string): Promise<boolean> {
        try {
            const sql = `UPDATE ${this.#user_info} SET profile_img = ? WHERE user_id = ?`;
            const results = await this.#db.query<OkPacket>(sql, [profile_img, userId]);
            return results.affectedRows > 0;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}
