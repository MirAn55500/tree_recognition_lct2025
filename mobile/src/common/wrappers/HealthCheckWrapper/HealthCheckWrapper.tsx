import { useEffect } from "react";

import { useCheckHealthQuery } from "services/api/health.api";
import { setCheckingStatus, setOnlineStatus } from "services/slices/onlineStatus.slice";

import useAppDispatch from "#hooks/useAppDispatch";

import { WrapperProps } from "../interface";

const HealthCheckWrapper: React.FC<WrapperProps> = ({ children }) => {
    const dispatch = useAppDispatch();

    const { isLoading, isError, isSuccess } = useCheckHealthQuery();

    useEffect(() => {
        dispatch(setCheckingStatus(isLoading));

        if (isSuccess) {
            dispatch(setOnlineStatus(true));
        }

        if (isError) {
            dispatch(setOnlineStatus(false));
        }
    }, [isLoading, isSuccess, isError, dispatch]);

    return <>{children}</>;
};

export default HealthCheckWrapper;
