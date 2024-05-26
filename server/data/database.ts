import mysql, { Connection, QueryError, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import { logger } from '../logger';
import dotenv from 'dotenv';

dotenv.config();

interface SqlError extends Omit<QueryError, 'code'> {
  code: string;
  errno?: number;
  sqlMessage?: string;
  sqlState?: string;
  index?: number;
  sql?: string;
}

export default class Database {
  #connection: Connection;

  constructor() {
    this.#connection = mysql.createConnection({
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
    });
  }

  query<T = any>(sql: string, args?: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, args, (err, rows) => {
        if (err) {
          this.handleQueryErr(err);
          return reject(err);
        }
        resolve(rows as T[]);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.#connection.end((err) => {
        if (err) {
          this.handleQueryErr(err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  conn(): Connection {
    return this.#connection;
  }

  handleQueryErr(err: SqlError): SqlError {
    let sqlErr: SqlError = {
      ...err,
      code: 'DB_ERROR',
    };

    if (process.env.SERVER_ENV === 'development') {
      sqlErr = {
        ...sqlErr,
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        index: err.index,
        sql: err.sql,
      };
      logger.error(sqlErr);
    }
    return sqlErr;
  }

  debugQuery(sql: string, args?: any[]): string | null {
    const query = this.#connection.format(sql, args);
    if (process.env.SERVER_ENV === 'development') {
      console.log('===== DEBUG QUERY MODE =====');
      console.log('QUERY:', sql);
      console.log('VALUES:', args);
      console.log('-----------------------------');
      console.log('FORMATTED QUERY:', query);
      console.log('===== DEBUG QUERY MODE =====');
      return query;
    }
    return null;
  }
}
