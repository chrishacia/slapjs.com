const Database = require('../database');
const { logger } = require('../../logger');

class Messages {
    #db;

    // tables
    #messages = 'messages';
    #replies = 'message_replies';
    #userInfo = 'user_information';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection() {
        await this.#db.close();
    }

    async getMessagesByUserId(userId = 0, mailboxType = 'inbox', sort = 'DESC') {
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
                ${mailboxType === 'inbox' ? 'm.recipientUserId' : 'm.senderUserId'} = ${userId}
                AND m.isDeleted = ${mailboxType !== 'inbox' && mailboxType !== 'sent' ? 1 : 0}
            GROUP BY
                m.id, m.msgChainId, m.senderUserId, m.recipientUserId, m.msgSubject, m.msgBody, m.createdDate, m.metadata
            ORDER BY
                m.createdDate ${sort};
            `;

            this.#db.debugQuery(sql);

            const results = await this.#db.query(sql);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMessagesByUUID(msgChainId = '', getDeleted = false) {
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
                m.msgChainId = '${msgChainId}'
                AND m.isDeleted = ${getDeleted ? 1 : 0}
                ORDER BY m.createdDate ASC
            `;
            const results = await this.#db.query(sql);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getAllMessagesInChain(msgChainId = '', getDeleted = false) {
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
                m.msgChainId = ${msgChainId}
                AND m.isDeleted = ${getDeleted ? 1 : 0}
                ORDER BY m.createdDate ASC
            `;
            const results = await this.#db.query(sql);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createMessageEntry(senderUserId = 0, recipientUserId = 0, subject= '', message = '', chainId = '', metadata = {}) {
        try {
            const sql = `
            INSERT INTO ${this.#messages}
                (msgChainId, senderUserId, recipientUserId, isSystemMsg, isDeleted, isRead, msgSubject, msgBody, createdDate, metadata)
            VALUES
                (${chainId ? chainId : 'UUID()'}, ${senderUserId}, ${recipientUserId}, 0, 0, 0, '${subject}', '${message}', NOW(), '${metadata}');
            `

            const results = await this.#db.query(sql);

            return await this.getMsgChainUUIDByMessageId(results.insertId);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMsgChainIdByUUID(msgUUID = '') {
        try {
            const sql = `
            SELECT
                msgChainId
            FROM ${this.#messages}
            WHERE
                msgUUID = '${msgUUID}'
            `;
            const results = await this.#db.query(sql);
            return results;
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getMsgChainUUIDByMessageId(messageId = 0) {
        try {
            const sql = `
            SELECT
                msgChainId
            FROM ${this.#messages}
            WHERE
                id = ${messageId}
            `;
            const results = await this.#db.query(sql);
            return results;
        }
        catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async createMessageReplyEntry(messageData = {}) {
        try {
            const sql = `
            INSERT INTO ${this.#replies}
                (originalMessageId, replyMessageId)
            VALUES
                (${messageData.originalMessageId}, ${messageData.replyMessageId})
            `;
            const results = await this.#db.query(sql);
            if(results.affectedRows === 0){
                return 0;
            }
            return results.insertId;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async deleteMessageById(messageId = 0) {
        try {
            const sql = `
            UPDATE ${this.#messages}
            SET isDeleted = 1
            WHERE id = ${messageId}
            `;
            const results = await this.#db.query(sql);
            if(results.affectedRows === 0){
                return false;
            }

            return true;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async setMessageAsRead(messageId = 0) {
        try {
            const sql = `
            UPDATE ${this.#messages}
            SET isRead = 1
            WHERE id = ${messageId}
            `;
            const results = await this.#db.query(sql);
            if(results.affectedRows === 0){
                return false;
            }

            return true;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async getCounts(userId = 0) {
        try {
            const sql = `
            SELECT
                COUNT(m.id) AS totalMessages,
                SUM(CASE WHEN m.isRead = 0 THEN 1 ELSE 0 END) AS unreadMessages
            FROM ${this.#messages} m
            WHERE
                m.recipientUserId = ${userId}
                AND m.isDeleted = 0
            `;
            const results = await this.#db.query(sql);
            return results;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}

module.exports = Messages;