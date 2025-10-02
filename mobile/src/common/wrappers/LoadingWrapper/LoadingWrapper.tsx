import React, { useEffect, useRef } from "react";
import { Toast } from "@ant-design/react-native";

import useAppSelector from "#hooks/useAppSelector";

import { WrapperProps } from "../interface";

const LoadingWrapper: React.FC<WrapperProps> = ({ children }) => {
    const loading = useAppSelector((state) => state.loading.isLoading);
    const loaderRef = useRef<number>(null);

    useEffect(() => {
        if (loading) {
            loaderRef.current = Toast.loading({ content: "Загрузка...", mask: true }, 0);
        } else if (loaderRef.current) {
            Toast.remove(loaderRef.current);
        }
    }, [loading]);

    return children;
};

export default LoadingWrapper;
