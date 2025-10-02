import { setOnlineStatus, toggleOnlineStatus } from "services/slices/onlineStatus.slice";

import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export const useOnlineStatus = () => {
    const dispatch = useAppDispatch();
    const { isOnline, isChecking } = useAppSelector((state) => state.onlineStatus);

    return {
        isOnline,
        isChecking,
        toggleOnlineStatus: () => dispatch(toggleOnlineStatus()),
        setOnlineStatus: (status: boolean) => dispatch(setOnlineStatus(status)),
    };
};
