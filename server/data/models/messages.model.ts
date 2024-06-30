import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import Database from '../database';
import { logger } from '../../logger';
import { MessageReplyEntry, MessageCounts, MessageIdChainId, MsgChainId } from '../../types/messages.types';


class Messages {
  private db: Database;

  // tables
  private messages = 'messages';
  private replies = 'message_replies';
  private userInfo = 'user_information';

  constructor() {
    this.db = new Database();
  }

  async closeConnection(): Promise<void> {
    await this.db.close();
  }

  async getMessagesByUserId(userId = 0, mailboxType = 'inbox', sort = 'DESC'): Promise<RowDataPacket[]> {
    try {
      let whereClause = '';
      if (mailboxType === 'inbox') {
        whereClause = `m.recipientUserId = ${userId} AND m.isDeletedRecipient = 0`;
      } else if (mailboxType === 'sent') {
        whereClause = `m.senderUserId = ${userId} AND m.isDeletedSender = 0`;
      } else if (mailboxType === 'trash') {
        whereClause = `(m.recipientUserId = ${userId} AND m.isDeletedRecipient = 1)
                           OR (m.senderUserId = ${userId} AND m.isDeletedSender = 1)`;
      } else {
        throw new Error('Invalid mailbox type');
      }

      const sql = `
        SELECT
            m.id,
            m.msgChainId,
            m.msgId,
            m.senderUserId,
            m.recipientUserId,
            m.isReadSender,
            m.isReadRecipient,
            m.isDeletedSender,
            m.isDeletedRecipient,
            m.msgSubject,
            m.msgBody,
            m.createdDate,
            m.metadata,
            u.name,
            COUNT(m2.id) AS totalMessagesInChain,
            SUM(CASE WHEN ${
              mailboxType === 'inbox' ? 'm2.isReadRecipient' : 'm2.isReadSender'
            } = 0 THEN 1 ELSE 0 END) AS unreadMessages
        FROM ${this.messages} m
        LEFT JOIN ${this.messages} m2 ON m.msgChainId = m2.msgChainId
        LEFT JOIN ${this.userInfo} u ON m.senderUserId = u.user_id
        WHERE ${whereClause}
        GROUP BY
            m.id, m.msgChainId, m.senderUserId, m.recipientUserId, m.msgSubject, m.msgBody, m.createdDate, m.metadata
        ORDER BY
            m.createdDate ${sort};
        `;

      const results = await this.db.query(sql) as RowDataPacket[];
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
                m.msgId,
                m.senderUserId,
                m.msgSubject,
                m.msgBody,
                m.createdDate,
                m.metadata,
                u.firstName,
                u.lastName,
                COUNT(m2.id) AS totalMessagesInChain,
                SUM(CASE WHEN m2.isReadRecipient = 0 THEN 1 ELSE 0 END) AS unreadMessages
            FROM ${this.messages} m
            LEFT JOIN ${this.messages} m2 ON m.msgChainId = m2.msgChainId
            LEFT JOIN ${this.userInfo} u ON m.senderUserId = u.user_id
            WHERE
                m.msgChainId = '${msgChainId}'
                AND ${
                  getDeleted
                    ? 'm.isDeletedRecipient = 1'
                    : 'm.isDeletedRecipient = 0'
                }
            ORDER BY m.createdDate ASC
            `;
      const results = await this.db.query(sql) as RowDataPacket[];
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
                m.msgId,
                m.senderUserId,
                m.msgSubject,
                m.msgBody,
                m.createdDate,
                m.metadata,
                u.firstName,
                u.lastName
            FROM ${this.messages} m
            LEFT JOIN ${this.userInfo} u ON m.senderUserId = u.user_id
            WHERE
                m.msgChainId = '${msgChainId}'
                AND ${
                  getDeleted
                    ? 'm.isDeletedRecipient = 1'
                    : 'm.isDeletedRecipient = 0'
                }
            ORDER BY m.createdDate ASC
            `;
      const results = await this.db.query(sql) as RowDataPacket[];
      return results;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async deleteMessageByUserId(userId = 0, messageId = ''): Promise<boolean> {
    try {
      const findUserRoleSql = `
                SELECT
                    senderUserId,
                    recipientUserId
                FROM ${this.messages}
                WHERE msgId = '${messageId}'
            `;
      const userRoleResults = await this.db.query(findUserRoleSql) as RowDataPacket[];

      if (userRoleResults.length === 0) {
        throw new Error('Message not found');
      }

      const { senderUserId, recipientUserId } = userRoleResults[0] as { senderUserId: number, recipientUserId: number };
      let setClause = '';

      if (Number(userId) === recipientUserId) {
        setClause = `m.isDeletedRecipient = 1, m.dateDeletedRecipient = NOW()`;
      } else if (Number(userId) === senderUserId) {
        setClause = `m.isDeletedSender = 1, m.dateDeletedSender = NOW()`;
      } else {
        throw new Error('User is neither the sender nor the recipient');
      }

      const sql = `
                UPDATE ${this.messages} m
                SET ${setClause}
                WHERE m.msgId = '${messageId}'
            `;

      const results = await this.db.query(sql) as ResultSetHeader;

      if (results.affectedRows === 0) {
        return false;
      }

      return true;
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
    metadata: object = {}
  ): Promise<string> {
    try {
      const uuid1 = uuidv4();
      const uuid2 = uuidv4();

      const sql = `
            INSERT INTO ${this.messages}
                (msgChainId, senderUserId, recipientUserId, isDeletedSender, isDeletedRecipient, isReadSender, isReadRecipient, msgSubject, msgBody, createdDate, metadata, msgId)
            VALUES
                (${
                  chainId ? `'${chainId}'` : `'${uuid1}'`
                }, ${senderUserId}, ${recipientUserId}, 0, 0, 0, 0, '${subject}', '${message}', NOW(), '${JSON.stringify(metadata)}', '${uuid2}');
            `;

      const results = await this.db.query(sql) as ResultSetHeader;
      const newMessageId = results.insertId;

      const msgIds = await this.getMsgIdAndChainIdById(newMessageId);

      if (Object.keys(msgIds).length > 0) {
        await this.createMessageReplyEntry({
          originalMessageId: msgIds.msgChainId,
          replyMessageId: msgIds.msgId,
        });
      }

      const msgChainUUID = await this.getMsgChainUUIDByMessageId(newMessageId);
      return msgChainUUID.msgChainId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getMsgIdAndChainIdById(id: number): Promise<MessageIdChainId> {
    try {
      const sql = `
            SELECT
                msgChainId,
                msgId
            FROM ${this.messages}
            WHERE
                id = ${id}
            `;
      const results = await this.db.query(sql) as RowDataPacket[];
      if (results.length === 0) {
        throw new Error('Message not found');
      }

      return results[0] as MessageIdChainId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getMsgChainIdByUUID(msgUUID = ''): Promise<MsgChainId> {
    try {
      const sql = `
            SELECT
                msgChainId
            FROM ${this.messages}
            WHERE
                msgUUID = '${msgUUID}'
            `;
      const results = await this.db.query(sql) as RowDataPacket[];
      if (results.length === 0) {
        throw new Error('Message not found');
      }
      return results[0] as MsgChainId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getMsgChainUUIDByMessageId(messageId = 0): Promise<MsgChainId> {
    try {
      const sql = `
            SELECT
                msgChainId
            FROM ${this.messages}
            WHERE
                id = ${messageId}
            `;
      const results = await this.db.query(sql) as RowDataPacket[];
      if (results.length === 0) {
        throw new Error('Message not found');
      }
      return results[0] as MsgChainId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async createMessageReplyEntry(messageData: MessageReplyEntry): Promise<number> {
    try {
      const sql = `
            INSERT INTO ${this.replies}
                (originalMessageId, replyMessageId)
            VALUES
                ('${messageData.originalMessageId}', '${messageData.replyMessageId}')
            `;
      const results = await this.db.query(sql) as ResultSetHeader;
      if (results.affectedRows === 0) {
        throw new Error('Failed to create message reply entry');
      }
      return results.insertId;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async deleteMessageById(messageId = ''): Promise<boolean> {
    try {
      const sql = `
            UPDATE ${this.messages}
            SET isDeletedRecipient = 1
            WHERE msgId = '${messageId}'
            `;
      const results = await this.db.query(sql) as ResultSetHeader;
      if (results.affectedRows === 0) {
        return false;
      }

      return true;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async setMessageAsRead(messageId = '', userId = '0'): Promise<boolean> {
    try {
      const sql = `
            UPDATE ${this.messages}
            SET ${
              userId === 'senderUserId' ? 'isReadSender' : 'isReadRecipient'
            } = 1
            WHERE msgId = '${messageId}'
            `;
      const results = await this.db.query(sql) as ResultSetHeader;
      if (results.affectedRows === 0) {
        return false;
      }

      return true;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getCounts(userId = 0): Promise<MessageCounts> {
    try {
      const sql = `
            SELECT
                COUNT(m.id) AS totalMessages,
                SUM(CASE WHEN m.isReadRecipient = 0 THEN 1 ELSE 0 END) AS unreadMessages
            FROM ${this.messages} m
            WHERE
                m.recipientUserId = ${userId}
                AND m.isDeletedRecipient = 0
            `;
      const results = await this.db.query(sql) as RowDataPacket[];

      if (results.length === 0) {
        return { totalMessages: 0, unreadMessages: 0 };
      }

      return results[0] as MessageCounts;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async toggleReadStatus(messageId = '', userId = '0'): Promise<boolean> {
    try {
      const sql = `
            UPDATE ${this.messages}
            SET ${
              userId === 'senderUserId' ? 'isReadSender' : 'isReadRecipient'
            } = IF(${
        userId === 'senderUserId' ? 'isReadSender' : 'isReadRecipient'
      } = 1, 0, 1),
                ${
                  userId === 'senderUserId'
                    ? 'dateReadSender'
                    : 'dateReadRecipient'
                } = IF(${
        userId === 'senderUserId' ? 'dateReadSender' : 'dateReadRecipient'
      } IS NOT NULL, NULL, NOW())
            WHERE msgId = '${messageId}'
            `;
      const results = await this.db.query(sql) as ResultSetHeader;
      if (results.affectedRows === 0) {
        return false;
      }

      return true;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

export default Messages;
