import { isRejectedWithValue, isRejected } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { message } from "antd";

const errorMiddleware: Middleware = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        message.error((action.payload as { error?: string })?.error || "Что-то пошло не так");
    } else if (isRejected(action)) {
        message.error("Что-то пошло не так");
    }

    return next(action);
};

export default errorMiddleware;
