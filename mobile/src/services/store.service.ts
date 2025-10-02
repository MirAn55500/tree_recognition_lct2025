import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { researchApi } from "./api/research.api";
import { photoApi } from "./api/photo.api";
import { healthApi } from "./api/health.api";

import loadingReducer from "./slices/loading.slice";
import onlineStatusReducer from "./slices/onlineStatus.slice";

import loadingMiddleware from "./middlewares/loading.middleware";
import errorMiddleware from "./middlewares/error.middleware";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: ["onlineStatus"],
    blacklist: [researchApi.reducerPath, photoApi.reducerPath],
};

const rootReducer = combineReducers({
    researchApi: researchApi.reducer,
    photoApi: photoApi.reducer,
    healthApi: healthApi.reducer,
    loading: loadingReducer,
    onlineStatus: onlineStatusReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        })
            .concat(researchApi.middleware)
            .concat(photoApi.middleware)
            .concat(healthApi.middleware)
            .concat(loadingMiddleware)
            .concat(errorMiddleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
