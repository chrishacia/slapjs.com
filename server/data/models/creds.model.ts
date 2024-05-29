import { OkPacket, RowDataPacket } from 'mysql2/promise';

import Database from '../database';
import { logger } from '../../logger';
import { CreateUserVerificationData, UpdateUserCredentialsData, ValidateUserVerificationData } from '../../types/creds.types';

export default class Creds {
  #db: Database;

  #table_login = 'login';
  #table_verify = 'user_verification';

  constructor() {
    this.#db = new Database();
  }

  async updateUserCredentials(data: UpdateUserCredentialsData): Promise<RowDataPacket[]> {
    try {
      const sql = `UPDATE ${this.#table_login} SET pass = ?, salt = ? WHERE email = ?`;
      const values: [string, string, string] = [data.pass, data.salt, data.email];
      const results = await this.#db.query<RowDataPacket[]>(sql, values);
      return results;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createUserVerification(data: CreateUserVerificationData): Promise<{ id: number; code: string }> {
    try {
      const sql = `INSERT INTO ${this.#table_verify} (user_id, isUsed, issuedAt, hashy, vType) VALUES (?, 0, ?, ?, ?)`;
      const values: [number, string, string, string] = [data.user_id, data.issuedAt, data.hashy, data.vType];
      const results = await this.#db.query<OkPacket>(sql, values);
      return { id: results.insertId, code: data.hashy };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async validateUserVerification(data: ValidateUserVerificationData): Promise<RowDataPacket[]> {
    try {
      const sql = `SELECT * FROM ${this.#table_verify} WHERE id = ? AND user_id = ? AND hashy = ? AND isUsed = 0`;
      const values: [number, string, string] = [data.id, data.user_id, data.hashy];
      const results = await this.#db.query<RowDataPacket[]>(sql, values);
      return results;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async closeConnection(): Promise<void> {
    await this.#db.close();
  }
}
