import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";

export const healthApi = createApi({
    reducerPath: "healthApi",
    baseQuery: fetchBaseQuery({
        baseUrl: Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL,
        timeout: 10000,
    }),
    tagTypes: ["Health"],
    endpoints: (build) => ({
        checkHealth: build.query<{ status: string }, void>({
            query: () => "health",
            keepUnusedDataFor: 60,
        }),
    }),
});

export const { useCheckHealthQuery } = healthApi;
