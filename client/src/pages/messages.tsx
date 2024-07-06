import React, { useCallback, useContext, useEffect, useState, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Template } from '../components/template/index';
import logger from '../utils/logger';
import { HttpStatusCode } from '../types/http-status.types';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { ConfigContext } from '../context/ConfigContext';
import { humanDateShortestNoTime } from '../../../shared/utils/date.functions';
import { DialogModal } from '../components/dialog-modal';
import { DefaultResponse } from '../components/dialog-templates/index';
import { Message, ModalData } from './types/messages.types';

const Messages: React.FC = () => {
    const { userId, accessToken } = useContext(AuthContext);
    const { fetchCounts } = useContext(UserContext);
    const config = useContext(ConfigContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [whichMailbox, setWhichMailbox] = useState<string>('inbox');
    const [sortOrder, setSortOrder] = useState<string>('DESC');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isOkToSubmit, setIsOkToSubmit] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [modalData, setModalData] = useState<ModalData>({});

    const fetchMessages = useCallback(async (val = 'inbox', sort = 'DESC') => {
        setLoading(true);
        setError('');
        setMessages([]);
        setWhichMailbox(val);
        setSortOrder(sort);
        try {
            const res = await fetch(`${config.api_url}/messages?x=${userId}&t=${val}&s=${sort}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                logger.error('Failed to fetch');
                throw new Error('Failed to fetch');
            }

            const data = await res.json();
            setMessages(data.data);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            logger.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [config.api_url, userId, accessToken]);

    useEffect(() => {
        let isMounted = true; // track whether component is mounted
        fetchMessages().then(() => {
            if (isMounted) setLoading(false);
        });
        return () => { isMounted = false; }; // cleanup function to be called when component unmounts
    }, [fetchMessages]);

    const handleCloseModal = (): void => {
        setErrorMessage('');
        setSuccessMessage('');
        setIsModalOpen(false);
        setIsOkToSubmit(false);
    };

    const handleCloseModalSubmit = async (): Promise<void> => {
        // Send message
        setErrorMessage('');
        setSuccessMessage('');

        if (!modalData.message) {
            setErrorMessage('Please select a message');
            return;
        }

        await fetch(`${config.api_url}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                x: userId,
                y: modalData.senderUserId,
                s: `Re: ${modalData.msgSubject}`,
                m: modalData.message,
                metadata: JSON.stringify({ ...modalData.metadata }),
                messageId: modalData.messageId
            })
        })
            .then(res => {
                if (!res.ok) {
                    logger.error('Failed to send message');
                    throw new Error('Failed to send message');
                }
                return res.json();
            })
            .then(() => {
                setSuccessMessage('Message sent');
                setIsOkToSubmit(false);
                fetchMessages(whichMailbox);
            })
            .catch(err => {
                setErrorMessage('Failed to send message');
                logger.error(err);
            });
    };

    const processDeleteMessage = async (messageId: string): Promise<void> => {
        await fetch(`${config.api_url}/messages/${messageId}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== HttpStatusCode.NO_CONTENT) {
                    logger.log('Failed to delete message');
                    throw new Error('Failed to delete message');
                }
                console.log('Message deleted');
                fetchMessages(whichMailbox);
            })
            .catch(err => {
                logger.error(err);
            });
    };

    const handleKeyDeleteMessage = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (e.key === 'Enter') {
            handleDeleteMessage(e);
        }
    };

    const handleDeleteMessage = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>): Promise<void> => {
        e.stopPropagation();
        const target = e.target as HTMLButtonElement;
        const messageId = target.getAttribute('data-message-id');
        if (messageId) {
            await processDeleteMessage(messageId);
        }
    };

    const handleOpenModalDialog = (data: ModalData): void => {
        setModalData(data);
        setIsModalOpen(true);
    };

    const setMessageAsRead = async (messageId: string): Promise<void> => {
        await fetch(`${config.api_url}/message/${messageId}/action?x=read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, messageId })
        })
            .then(res => {
                if (!res.ok) {
                    logger.error('Failed to mark as read');
                    throw new Error('Failed to mark as read');
                }
                return res.json();
            })
            .then(() => {
                console.log('Message marked as read');
                fetchMessages(whichMailbox);
                fetchCounts();
            })
            .catch(err => {
                logger.error(err);
            });
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {
                loading ? <div>Loading...</div> :
                    error ? <h1>Error: {error}</h1> :
                        <Template>
                            <div className="d-flex p-2" style={{ backgroundColor: '#000' }}>
                                <h2>Messages</h2>
                                {
                                    (whichMailbox === 'trash' || whichMailbox === 'sent') &&
                                    <div className="alert alert-warning">Messages marked as <strong>{whichMailbox}</strong> will be deleted after 30 days</div>
                                }

                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col" onClick={() => fetchMessages(whichMailbox, sortOrder === 'DESC' ? 'ASC' : 'DESC')}>
                                                Date {sortOrder === 'DESC' ? '▼' : '▲'}
                                            </th>
                                            <th scope="col">From</th>
                                            <th scope="col">Subject</th>
                                            <th scope="col">&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            messages.length === 0 ?
                                                <tr><td colSpan={5} className="text-center p-3">No messages</td></tr>
                                                :
                                                messages.map((message) => (
                                                    <tr
                                                        key={message.msgId}
                                                        onClick={() => {
                                                            if (whichMailbox === 'inbox' && parseInt(message.isReadRecipient) !== 1 && message.recipientUserId === userId) {
                                                                setMessageAsRead(message.msgId);
                                                            }

                                                            if (whichMailbox === 'sent' && parseInt(message.isReadSender) !== 1 && message.senderUserId === userId) {
                                                                setMessageAsRead(message.msgId);
                                                            }

                                                            handleOpenModalDialog({ ...message, metadata: JSON.parse(message.metadata) });
                                                        }}
                                                        style={{ fontWeight: parseInt(message.isReadRecipient) ? 'normal' : 'bold' }}
                                                    >
                                                        <td>{humanDateShortestNoTime(message.createdDate)}</td>
                                                        <td>{message.name}</td>
                                                        <td>{message.msgSubject}</td>
                                                        <td>
                                                            <button
                                                                tabIndex={0}
                                                                data-message-id={message.msgId}
                                                                onClick={handleDeleteMessage}
                                                                onKeyDown={handleKeyDeleteMessage}
                                                                style={{ display: whichMailbox === 'trash' ? 'none' : 'inline' }}
                                                            >
                                                                [D]
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {isModalOpen && <DialogModal
                                title={modalData.msgSubject || ''}
                                body={
                                    <DefaultResponse
                                        modalData={modalData}
                                        handleMessageChange={(e) => {
                                            const val = e.target.value;
                                            setIsOkToSubmit(val.length > 0);
                                            setModalData({ ...modalData, message: val });
                                        }}
                                    />
                                }
                                errorMessage={errorMessage}
                                successMessage={successMessage}
                                closeDialog={handleCloseModal}
                                closeDialogSubmit={handleCloseModalSubmit}
                                closeDialogSubmitDisabled={!isOkToSubmit}
                                closeText="Cancel"
                                closeSubmitText="Send Reply"
                                hideCloseOnly={false}
                            />}
                        </Template>
            }
        </Suspense>
    );
};

// Ensure the 'root' element exists and is of type HTMLElement
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Messages />);
} else {
    logger.error('Root element not found');
}
