export interface MessageData {
    senderUserId: number;
    recipientUserId: number;
    subject: string;
    message: string;
    chainId?: string;
    metadata?: object;
  }

  export interface MessageReplyEntry {
    originalMessageId: string;
    replyMessageId: string;
  }

  export interface MessageCounts {
    totalMessages: number;
    unreadMessages: number;
  }

  export interface MessageIdChainId {
    msgChainId: string;
    msgId: string;
  }

  export interface MsgChainId {
    msgChainId: string;
  }
