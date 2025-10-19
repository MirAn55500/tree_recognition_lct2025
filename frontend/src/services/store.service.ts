import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";

import { researchApi } from "./api/research.api";
import { photoApi } from "./api/photo.api";
import { mapApi } from "./api/map.api";
import { datasetApi } from "./api/dataset.api";

import loadingReducer from "./slices/loading.slice";

import loadingMiddleware from "./middlewares/loading.middleware";
import errorMiddleware from "./middlewares/error.middleware";

const rootReducer = combineReducers({
    researchApi: researchApi.reducer,
    photoApi: photoApi.reducer,
    mapApi: mapApi.reducer,
    datasetApi: datasetApi.reducer,
    loading: loadingReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(researchApi.middleware)
            .concat(photoApi.middleware)
            .concat(mapApi.middleware)
            .concat(datasetApi.middleware)
            .concat(loadingMiddleware)
            .concat(errorMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
