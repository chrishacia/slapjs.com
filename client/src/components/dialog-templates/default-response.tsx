import React, { useState } from 'react';
import { ConfigContext } from '../../context/ConfigContext';
import { humanDate } from '../../../../shared/utils/date.functions';
import { DialogTemplateDefaultResponseProps } from './types/default-response.types';

export const DialogTemplateDefaultResponse: React.FC<DialogTemplateDefaultResponseProps> = (props) => {
    const cfg = React.useContext(ConfigContext);
    const [isReplyMode, setIsReplyMode] = useState<boolean>(false);
    const { modalData } = props;

    return (
        <div>
            <div className="mb-1">From: {modalData.name}</div>
            <div className="mb-4">Date: {humanDate(modalData.createdDate)}</div>
            {modalData.metadata.imgFileName && (
                <div className="mb-4">
                    <img
                        className="rounded mx-auto d-block img-fluid"
                        style={{ maxHeight: '250px' }}
                        src={`${cfg.img_url}/${modalData.metadata.imgFileName}`}
                        alt={modalData.metadata?.imgAltText || 'Unknown Alt Text'}
                    />
                </div>
            )}
            <div className="d-grid gap-1 mb-4">
                <button
                    className="btn btn-lg btn-info"
                    onClick={() => {
                        setIsReplyMode(!isReplyMode);
                    }}
                >
                    {!isReplyMode ? 'Reply to this message' : 'Cancel reply'}
                </button>
                {isReplyMode && (
                    <div className="mb-3">
                        <label htmlFor="messageReply" className="form-label">Message reply:</label>
                        <textarea
                            className="form-control"
                            id="messageReply"
                            rows={4}
                            onChange={props.handleMessageChange}
                        ></textarea>
                    </div>
                )}
            </div>
            <div className="mb-1">{modalData.msgBody}</div>
        </div>
    );
};
