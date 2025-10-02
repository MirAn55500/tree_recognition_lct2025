import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PendingAction, PendingResearchData, PendingActionType } from "#types/pendingActions";

interface OnlineStatusState {
    isOnline: boolean;
    isChecking: boolean;
    lastChecked: string | null;
    pendingActions: PendingAction[];
    isSyncing: boolean;
}

const initialState: OnlineStatusState = {
    isOnline: true,
    isChecking: false,
    lastChecked: null,
    pendingActions: [],
    isSyncing: false,
};

const onlineStatusSlice = createSlice({
    name: "onlineStatus",
    initialState,
    reducers: {
        setOnlineStatus: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
            state.lastChecked = new Date().toISOString();
        },
        setCheckingStatus: (state, action: PayloadAction<boolean>) => {
            state.isChecking = action.payload;
        },
        toggleOnlineStatus: (state) => {
            state.isOnline = !state.isOnline;
            state.lastChecked = new Date().toISOString();
        },
        addPendingResearch: (state, action: PayloadAction<PendingResearchData>) => {
            const newAction: PendingAction = {
                id: Date.now().toString(),
                type: "CREATE_RESEARCH_WITH_PHOTOS",
                payload: action.payload,
                timestamp: new Date().toISOString(),
                retryCount: 0,
            };
            state.pendingActions.push(newAction);
        },
        removePendingAction: (state, action: PayloadAction<string>) => {
            state.pendingActions = state.pendingActions.filter(
                (pendingAction) => pendingAction.id !== action.payload
            );
        },
        incrementRetryCount: (state, action: PayloadAction<string>) => {
            const actionToUpdate = state.pendingActions.find(
                (pendingAction) => pendingAction.id === action.payload
            );
            if (actionToUpdate) {
                actionToUpdate.retryCount += 1;
            }
        },
        setSyncing: (state, action: PayloadAction<boolean>) => {
            state.isSyncing = action.payload;
        },
        clearPendingActions: (state) => {
            state.pendingActions = [];
        },
    },
});

export const {
    setOnlineStatus,
    setCheckingStatus,
    toggleOnlineStatus,
    addPendingResearch,
    removePendingAction,
    incrementRetryCount,
    setSyncing,
    clearPendingActions,
} = onlineStatusSlice.actions;
export default onlineStatusSlice.reducer;
