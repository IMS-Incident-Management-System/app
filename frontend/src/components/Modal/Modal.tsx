import { Modal, ModalProps } from "antd";

export const ModalComponent = ({ children, ...props }: ModalProps) => {
  return (
    <Modal
      {...props}
      okText={props.okText ?? "Сохранить"}
      cancelText={props.cancelText ?? "Отменить"}
    >
      {children}
    </Modal>
  );
};
