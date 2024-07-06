/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Message {
    createdDate: string;
    isReadRecipient: string;
    isReadSender: string;
    metadata: string;
    msgId: string;
    msgSubject: string;
    name: string;
    recipientUserId: string;
    senderUserId: string;
}

export interface ModalData {
    createdDate?: string;
    message?: string;
    messageId?: string;
    msgBody?: string;
    metadata?: Record<string, any>;
    msgSubject?: string;
    name?: string;
    senderUserId?: string;
}