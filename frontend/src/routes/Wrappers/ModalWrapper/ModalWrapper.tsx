import { useCallback, useState, type ReactNode } from "react";
import { Modal } from "antd";

import ModalContext, { type CustomModalProps, type IModalConfig } from "@contexts/ModalContext";

import type { WrapperProps } from "../wrappers.type";

import "./ModalWrapper.css";

const ModalWrapper: React.FC<WrapperProps> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [content, setContent] = useState<ReactNode>(null);
    const [props, setProps] = useState<CustomModalProps>();

    const openModal = useCallback((config: IModalConfig) => {
        setContent(config.content);
        setProps(config.props || {});
        setOpen(true);
    }, []);

    const closeModal = () => {
        props?.handleCancel && props.handleCancel();
        setOpen(false);
    };

    const handleAfterClose = () => {
        setContent(null);
        setProps({});
    };

    return (
        <>
            <ModalContext.Provider value={{ open: openModal, close: closeModal }}>
                {children}

                <Modal
                    zIndex={1001}
                    maskClosable
                    centered
                    open={open}
                    onCancel={closeModal}
                    afterClose={handleAfterClose}
                    {...props}
                    destroyOnHidden
                    width={{
                        xs: "90%",
                        sm: "80%",
                        md: "70%",
                        lg: "60%",
                        xl: "50%",
                        xxl: "40%",
                    }}
                    wrapClassName={props?.fullHeight ? "modal-full-height-wrap" : undefined}
                >
                    {content}
                </Modal>
            </ModalContext.Provider>
        </>
    );
};

export default ModalWrapper;
