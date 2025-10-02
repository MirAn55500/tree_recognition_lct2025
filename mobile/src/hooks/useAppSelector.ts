import { useSelector, type TypedUseSelectorHook } from "react-redux";

import { RootState } from "services/store.service";

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
