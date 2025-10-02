import type { MessageInstance } from "antd/es/message/interface";
import { createContext } from "react";

interface IMessageContext {
    messageApi: MessageInstance | undefined;
}

const defaultValues: IMessageContext = {
    messageApi: undefined,
};

const MessageContext = createContext(defaultValues);

export default MessageContext;
