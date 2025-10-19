import type { ModalProps } from "antd";
import { createContext, type ReactNode } from "react";

export type CustomModalProps = { handleCancel?: () => void; fullHeight?: boolean } & Omit<
    ModalProps,
    "open" | "onCancel" | "centered"
>;

export interface IModalConfig {
    content: ReactNode;
    props?: CustomModalProps;
}

interface IModalContext {
    open: (config: IModalConfig) => void;
    close: () => void;
}

const defaultValues: IModalContext = {
    open: () => {},
    close: () => {},
};

const ModalContext = createContext(defaultValues);

export default ModalContext;
