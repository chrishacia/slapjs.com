// Desc: Login model

const Database = require('../database');
const {logger} = require('../../logger');

class Users {
  #db;

  // tables
  #login_table = 'login';

  #user_info = 'user_information';

  constructor() {
    this.#db = new Database();
  }

  async getUserExistsByEmail(email) {
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

  async getUserExistsById(id) {
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

  async getUserInformationById(id) {
    try {
      const sql = `SELECT * FROM ${this.#user_info} WHERE id = ? limit 1`;
      const results = await this.#db.query(sql, [id]);
      if (results.length > 0) {
        return results[0];
      }
      return false;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getUserInformationByEmail(email) {
    try {
      const sql = `SELECT * FROM ${this.#user_info} WHERE email = ? limit 1`;
      const results = await this.#db.query(sql, [email]);
      if (results.length > 0) {
        return results[0];
      }
      return false;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getUserIdByEmail(email) {
    try {
      const sql = `SELECT id FROM ${this.#login_table} WHERE email = ? limit 1`;
      const results = await this.#db.query(sql, [email]);
      return results[0].id || false;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createUserInformation(data) {
    try {
      const sql = `INSERT INTO ${this.#user_info} (user_id, first_name, last_name, profile_img, dob)`;
      const values = `VALUES ('${data.id}', '${data.first_name}', '${data.last_name}', '${data.profile_img}', '${data.dob}')`;
      const results = await this.#db.query(sql + values);
      return results;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async updateUserInformation(data) {
    try {
      const sql = `UPDATE ${this.#user_info} SET first_name = ?, last_name = ?, profile_img = ?, dob = ? WHERE user_id = ?`;
      const results = await this.#db.query(sql, [
        data.first_name,
        data.last_name,
        data.profile_img,
        data.dob,
        data.id,
      ]);

      return results;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

module.exports = Users;
