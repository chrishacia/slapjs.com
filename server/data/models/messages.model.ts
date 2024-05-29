import { RowDataPacket, OkPacket } from 'mysql2';

import Database from '../database';
import { logger } from '../../logger';

export default class Messages {
    #db: Database;

    // tables
    #messages = 'messages';
    #replies = 'message_replies';
    #userInfo = 'user_information';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection(): Promise<void> {
        await this.#db.close();
    }

    async getMessagesByUserId(userId = 0, mailboxType = 'inbox', sort = 'DESC'): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          m.id,
          m.msgChainId,
          m.senderUserId,
          m.recipientUserId,
          m.isRead,
          m.msgSubject,
          m.msgBody,
          m.createdDate,
          m.metadata,
          u.name,
          COUNT(m2.id) AS totalMessagesInChain,
          SUM(CASE WHEN m2.isRead = 0 THEN 1 ELSE 0 END) AS unreadMessages
        FROM ${this.#messages} m
        LEFT JOIN ${this.#messages} m2 ON m.msgChainId = m2.msgChainId
        LEFT JOIN ${this.#userInfo} u ON m.senderUserId = u.user_id
        WHERE
          ${mailboxType === 'inbox' ? 'm.recipientUserId' : 'm.senderUserId'} = ?
          AND m.isDeleted = ?
        GROUP BY
          m.id, m.msgChainId, m.senderUserId, m.recipientUserId, m.msgSubject, m.msgBody, m.createdDate, m.metadata
        ORDER BY
          m.createdDate ${sort};
      `;

            this.#db.debugQuery(sql);

            const results = await this.#db.query<RowDataPacket[]>(sql, [userId, mailboxType !== 'inbox' && mailboxType !== 'sent' ? 1 : 0]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMessagesByUUID(msgChainId = '', getDeleted = false): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          m.id,
          m.msgChainId,
          m.senderUserId,
          m.msgSubject,
          m.msgBody,
          m.createdDate,
          m.metadata,
          u.firstName,
          u.lastName,
          COUNT(m2.id) AS totalMessagesInChain,
          SUM(CASE WHEN m2.isRead = 0 THEN 1 ELSE 0 END) AS unreadMessages
        FROM ${this.#messages} m
        LEFT JOIN ${this.#messages} m2 ON m.msgChainId = m2.msgChainId
        LEFT JOIN ${this.#userInfo} u ON m.senderUserId = u.user_id
        WHERE
          m.msgChainId = ?
          AND m.isDeleted = ?
        ORDER BY m.createdDate ASC
      `;
            const results = await this.#db.query<RowDataPacket[]>(sql, [msgChainId, getDeleted ? 1 : 0]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getAllMessagesInChain(msgChainId = '', getDeleted = false): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          m.id,
          m.msgChainId,
          m.senderUserId,
          m.msgSubject,
          m.msgBody,
          m.createdDate,
          m.metadata,
          u.firstName,
          u.lastName
        FROM ${this.#messages} m
        LEFT JOIN ${this.#userInfo} u ON m.senderUserId = u.user_id
        WHERE
          m.msgChainId = ?
          AND m.isDeleted = ?
        ORDER BY m.createdDate ASC
      `;
            const results = await this.#db.query<RowDataPacket[]>(sql, [msgChainId, getDeleted ? 1 : 0]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createMessageEntry(
        senderUserId = 0,
        recipientUserId = 0,
        subject = '',
        message = '',
        chainId = '',
        metadata = ''
    ): Promise<string[]> {
        try {
            const sql = `
        INSERT INTO ${this.#messages}
          (msgChainId, senderUserId, recipientUserId, isSystemMsg, isDeleted, isRead, msgSubject, msgBody, createdDate, metadata)
        VALUES
          (?, ?, ?, 0, 0, 0, ?, ?, NOW(), ?);
      `;

            const results = await this.#db.query<OkPacket>(sql, [chainId ? chainId : 'UUID()', senderUserId, recipientUserId, subject, message, metadata]);

            const msgChainIds = await this.getMsgChainUUIDByMessageId(results.insertId);
            return msgChainIds.map(row => row.msgChainId);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMsgChainIdByUUID(msgUUID = ''): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          msgChainId
        FROM ${this.#messages}
        WHERE
          msgUUID = ?
      `;
            const results = await this.#db.query<RowDataPacket[]>(sql, [msgUUID]);
            return results;
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMsgChainUUIDByMessageId(messageId = 0): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          msgChainId
        FROM ${this.#messages}
        WHERE
          id = ?
      `;
            const results = await this.#db.query<RowDataPacket[]>(sql, [messageId]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }


    async createMessageReplyEntry(
        messageData: {
            originalMessageId: number;
            replyMessageId: number;
        } = {
                originalMessageId: 0,
                replyMessageId: 0
            }): Promise<number> {
        try {
            const sql = `
        INSERT INTO ${this.#replies}
          (originalMessageId, replyMessageId)
        VALUES
          (?, ?)
      `;
            const results = await this.#db.query<OkPacket>(sql, [messageData.originalMessageId, messageData.replyMessageId]);
            if (results.affectedRows === 0) {
                return 0;
            }
            return results.insertId;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async deleteMessageById(messageId = 0): Promise<boolean> {
        try {
            const sql = `
        UPDATE ${this.#messages}
        SET isDeleted = 1
        WHERE id = ?
      `;
            const results = await this.#db.query<OkPacket>(sql, [messageId]);
            if (results.affectedRows === 0) {
                return false;
            }

            return true;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async setMessageAsRead(messageId = 0): Promise<boolean> {
        try {
            const sql = `
        UPDATE ${this.#messages}
        SET isRead = 1
        WHERE id = ?
      `;
            const results = await this.#db.query<OkPacket>(sql, [messageId]);
            if (results.affectedRows === 0) {
                return false;
            }

            return true;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getCounts(userId = 0): Promise<RowDataPacket[]> {
        try {
            const sql = `
        SELECT
          COUNT(m.id) AS totalMessages,
          SUM(CASE WHEN m.isRead = 0 THEN 1 ELSE 0 END) AS unreadMessages
        FROM ${this.#messages} m
        WHERE
          m.recipientUserId = ?
          AND m.isDeleted = 0
      `;
            const results = await this.#db.query<RowDataPacket[]>(sql, [userId]);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}
