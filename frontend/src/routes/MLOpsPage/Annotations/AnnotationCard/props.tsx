import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    RobotOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";

import type { PhotoStatusResponse } from "#types/photo";

export const getStatusConfig = (
    isLoading?: boolean,
    isError?: boolean,
    data?: PhotoStatusResponse
) => {
    if (isLoading) {
        return {
            text: "Загрузка...",
            color: "processing",
            icon: <Spin size="small" />,
        };
    }

    if (isError || !data) {
        return {
            text: "Ошибка загрузки",
            color: "error",
            icon: <ExclamationCircleOutlined />,
        };
    }

    if (data.status === "uploaded") {
        return {
            text: "Не аннотировано",
            color: "warning",
            icon: <CloseCircleOutlined />,
        };
    }

    if (data.status === "processing") {
        return {
            text: "В процессе обработки моделью",
            color: "orange",
            icon: <ClockCircleOutlined />,
        };
    }

    if (data.status === "annotated") {
        return {
            text: "Аннотировано вручную",
            color: "success",
            icon: <CheckCircleOutlined />,
        };
    }

    return {
        text: "Аннотировано моделью",
        color: "blue",
        icon: <RobotOutlined />,
    };
};
