export interface ModalData {
  name?: string;
  createdDate?: string;
  metadata?: {
    imgFileName?: string;
    imgAltText?: string;
  };
  msgBody?: string;
}

export interface DialogTemplateDefaultResponseProps {
  modalData: ModalData;
  handleMessageChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
