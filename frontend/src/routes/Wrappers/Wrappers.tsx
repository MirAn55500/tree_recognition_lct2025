import { Outlet } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";

import MenuWrapper from "./MenuWrapper/MenuWrapper";
import ModalWrapper from "./ModalWrapper/ModalWrapper";
import MessageWrapper from "./MessageWrapper/MessageWrapper";
import LoadingWrapper from "./LoadingWrapper/LoadingWrapper";

import { store } from "@services/store.service";

const Wrappers = () => {
    return (
        <ReduxProvider store={store}>
            <LoadingWrapper>
                <MessageWrapper>
                    <MenuWrapper>
                        <ModalWrapper>
                            <Outlet />
                        </ModalWrapper>
                    </MenuWrapper>
                </MessageWrapper>
            </LoadingWrapper>
        </ReduxProvider>
    );
};

export default Wrappers;
