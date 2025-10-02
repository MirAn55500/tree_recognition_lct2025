import { message } from "antd";
import type React from "react";

import MessageContext from "@contexts/MessageContext";

import type { WrapperProps } from "../wrappers.type";

const MessageWrapper: React.FC<WrapperProps> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={{ messageApi }}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export default MessageWrapper;
