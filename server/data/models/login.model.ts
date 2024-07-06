import { RowDataPacket, OkPacket } from 'mysql2';
import Database from '../database';
import { logger } from '../../logger';
import { UserCredentials, CreateLoginData } from '../../types/login.types';

export default class Login {
  #db: Database;
  #table = 'login';
  #ipTable = 'blocked_ips';

  constructor() {
    this.#db = new Database();
  }

  async getPassDetailsForComparison(email: string): Promise<UserCredentials[]> {
    try {
      const sql = `SELECT pass, salt, failed_attempts, is_locked, last_attempt, status, verified FROM ${this.#table} WHERE email = ? LIMIT 1`;
      const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
      if (results.length > 0) {
        return results as UserCredentials[];
      }
      return [];
    } catch (err) {
      logger.error(JSON.stringify(err));
      return [];
    }
  }

  async getFailedAttempts(email: string): Promise<number> {
    try {
      const sql = `SELECT failed_attempts FROM ${this.#table} WHERE email = ? LIMIT 1`;
      const results = await this.#db.query<RowDataPacket[]>(sql, [email]);
      return results.length > 0 ? results[0].failed_attempts : 0;
    } catch (err) {
      logger.error(JSON.stringify(err));
      return 0;
    }
  }

  async incrementFailedAttempts(email: string): Promise<void> {
    try {
      const sql = `UPDATE ${this.#table} SET failed_attempts = failed_attempts + 1, last_attempt = NOW() WHERE email = ?`;
      await this.#db.query<OkPacket>(sql, [email]);
    } catch (err) {
      logger.error(JSON.stringify(err));
      return;
    }
  }

  async lockAccount(email: string): Promise<void> {
    try {
      const sql = `UPDATE ${this.#table} SET is_locked = 1 WHERE email = ?`;
      await this.#db.query<OkPacket>(sql, [email]);
    } catch (err) {
      logger.error(JSON.stringify(err));
      return;
    }
  }

  async resetFailedAttempts(email: string): Promise<void> {
    try {
      const sql = `UPDATE ${this.#table} SET failed_attempts = 0 WHERE email = ?`;
      await this.#db.query<OkPacket>(sql, [email]);
    } catch (err) {
      logger.error(JSON.stringify(err));
      return;
    }
  }

  async blockIp(ip: string): Promise<void> {
    try {
      const sql = `INSERT INTO ${this.#ipTable} (ip_address, blocked_until) VALUES (?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))`;
      await this.#db.query<OkPacket>(sql, [ip]);
    } catch (err) {
      logger.error(JSON.stringify(err));
      return;
    }
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    try {
      const sql = `SELECT * FROM ${this.#ipTable} WHERE ip_address = ? AND blocked_until > NOW()`;
      const results = await this.#db.query<RowDataPacket[]>(sql, [ip]);
      return results.length > 0;
    } catch (err) {
      logger.error(JSON.stringify(err));
      return false;
    }
  }

  async unlockAccount(email: string): Promise<void> {
    try {
      const sql = `UPDATE ${this.#table} SET is_locked = 0, failed_attempts = 0 WHERE email = ? AND last_attempt < DATE_SUB(NOW(), INTERVAL 30 MINUTE)`;
      await this.#db.query<OkPacket>(sql, [email]);
    } catch (err) {
      logger.error(JSON.stringify(err));
      return;
    }
  }

  async createLogin(data: CreateLoginData): Promise<number> {
    try {
      const sql = `INSERT INTO ${this.#table} (create_ts, email, pass, salt, status, verified) VALUES (?, ?, ?, ?, 0, 0)`;
      const values = [data.create_ts, data.email, data.pass, data.salt];
      const results = await this.#db.query<OkPacket>(sql, values);
      return results.insertId;
    } catch (err) {
      logger.error(JSON.stringify(err));
      return 0;
    }
  }

  async closeConnection(): Promise<void> {
    await this.#db.close();
  }
}
