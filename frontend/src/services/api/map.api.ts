import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MapArea, MapAreaStatistics, MapPoint } from "#types/map";

export const mapApi = createApi({
    reducerPath: "mapApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_API_URL }),
    endpoints: (build) => ({
        getAreas: build.query<MapArea[], void>({
            query: () => `get_areas`,
        }),
        getPoints: build.query<MapPoint[], void>({
            query: () => `get_map_points`,
        }),
        getAreaStats: build.query<MapAreaStatistics, number>({
            query: (id) => `get_area_statistics/${id}`,
        }),
    }),
});

export const { useGetAreasQuery, useGetPointsQuery, useGetAreaStatsQuery } = mapApi;
