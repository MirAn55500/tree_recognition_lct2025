import type React from "react";
import { Spin } from "antd";

import type { WrapperProps } from "../wrappers.type";

import useAppSelector from "@hooks/useAppSelector";

const LoadingWrapper: React.FC<WrapperProps> = ({ children }) => {
    const spinning = useAppSelector((state) => state.loading.isLoading);

    return (
        <>
            <Spin spinning={spinning} fullscreen />
            {children}
        </>
    );
};

export default LoadingWrapper;
