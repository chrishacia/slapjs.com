
import { RowDataPacket } from 'mysql2';

import Database from '../database';
import { logger } from '../../logger';
import { refreshTokenType, userIdType } from '../../types/jwt.types';

export default class JwtModel {
  #db: Database;

  #table = 'user_jwt_refresh';

  constructor() {
    this.#db = new Database();
  }

  async updateRefreshToken(userId: userIdType, refreshToken: refreshTokenType): Promise<void> {
    try {
      const sql = `UPDATE ${this.#table} SET refresh_token = ? WHERE userId = ?`;
      await this.#db.query(sql, [refreshToken.refreshToken, userId.userId]);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getRefreshToken(userId: userIdType): Promise<string> {
    try {
      const sql = `SELECT refresh_token FROM ${this.#table} WHERE userId = ?`;
      const results = await this.#db.query<RowDataPacket[]>(sql, [userId.userId]);
      if (results.length > 0) {
        return results[0].refresh_token;
      }
      return '';
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createRefreshToken(userId: userIdType, refreshToken: refreshTokenType): Promise<void> {
    try {
      const sql = `INSERT INTO ${this.#table} (userId, refresh_token) VALUES (?, ?)`;
      await this.#db.query(sql, [userId.userId, refreshToken.refreshToken]);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async closeConnection(): Promise<void> {
    await this.#db.close();
  }
}
