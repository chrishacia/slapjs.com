// src/types/DialogModalTypes.ts

export interface DialogModalProps {
    title: string;
    body: React.ReactNode;
    closeDialogSubmit: () => void;
    closeDialogSubmitDisabled: boolean;
    closeDialog: () => void;
    closeText: string;
    closeSubmitText: string;
    hideCloseOnly: boolean;
    errorMessage?: string;
    successMessage?: string;
}
