import React from 'react';
import { DialogModalProps } from './types/dialog-modal.types';

export const DialogModal: React.FC<DialogModalProps> = ({
    title,
    body,
    closeDialogSubmit,
    closeDialogSubmitDisabled,
    closeDialog,
    closeText,
    closeSubmitText,
    hideCloseOnly,
    errorMessage,
    successMessage
}) => {
    return (
        <>
            <div className="modal show fade mt-5" tabIndex={-1} style={{ display: 'block', maxHeight: '90%' }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            {!hideCloseOnly && (
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={closeDialog}
                                />
                            )}
                        </div>
                        <div className="modal-body">
                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    {successMessage}
                                </div>
                            )}
                            {body}
                        </div>
                        <div className="modal-footer">
                            {!hideCloseOnly && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                    onClick={closeDialog}
                                >
                                    {closeText}
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={closeDialogSubmit}
                                disabled={closeDialogSubmitDisabled}
                            >
                                {closeSubmitText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
};
