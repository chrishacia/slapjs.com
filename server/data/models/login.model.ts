import { RowDataPacket, OkPacket } from 'mysql2';

import Database from '../database';
import { logger } from '../../logger';
import { UserCredentials, CreateLoginData } from '../../types/login.types';

export default class Login {
  #db: Database;

  #table = 'login';

  constructor() {
    this.#db = new Database();
  }

  async getPassDetailsForComparison(email: string): Promise<UserCredentials[]> {
    try {
      const sql = `SELECT pass, salt FROM ${this.#table} WHERE email = ? LIMIT 1`;
      const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
      if (results.length > 0) {
        // User authenticated successfully
        return results as UserCredentials[];
      }
      // Authentication failed
      return [];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createLogin(data: CreateLoginData): Promise<number> {
    try {
      const sql = `INSERT INTO ${this.#table} (create_ts, email, pass, salt, status, verified) VALUES (?, ?, ?, ?, 0, 0)`;
      const values = [data.create_ts, data.email, data.pass, data.salt];
      const results = await this.#db.query<OkPacket>(sql, values);
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
