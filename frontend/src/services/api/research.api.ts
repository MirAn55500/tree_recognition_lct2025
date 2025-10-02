import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { ResearchDetailsItem, ResearchItem, ResearchRaw } from "#types/research";

export const researchApi = createApi({
    reducerPath: "researchApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_API_URL }),
    tagTypes: ["Research"],
    endpoints: (build) => ({
        getResearches: build.query<ResearchItem[], void>({
            query: () => `get_researches`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Research" as const, id })),
                          { type: "Research", id: "LIST" },
                      ]
                    : [{ type: "Research", id: "LIST" }],
        }),
        getResearch: build.query<ResearchDetailsItem, number>({
            query: (id) => `get_research/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Research", id }],
        }),
        createResearch: build.mutation<void, ResearchRaw>({
            query: (body) => ({ url: `create_research`, method: "POST", body }),
            invalidatesTags: [{ type: "Research", id: "LIST" }],
        }),
    }),
});

export const { useGetResearchesQuery, useGetResearchQuery, useCreateResearchMutation } = researchApi;
