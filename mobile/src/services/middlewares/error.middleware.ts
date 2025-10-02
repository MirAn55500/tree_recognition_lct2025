import { isRejectedWithValue, isRejected } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { Toast } from "@ant-design/react-native";

const errorMiddleware: Middleware = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        console.error(action);
        Toast.fail((action.payload as { error?: string })?.error || "Что-то пошло не так");
    } else if (isRejected(action)) {
        console.error(action);
        Toast.fail("Что-то пошло не так");
    }

    return next(action);
};

export default errorMiddleware;
