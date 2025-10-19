import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    PhotoAnnotation,
    PhotoIdsResponse,
    PhotoItem,
    PhotoStatusResponse,
    PhotoUploadRequest,
    PhotoUploadResponse,
    ProcessPhotoResponse,
} from "#types/photo";

export const photoApi = createApi({
    reducerPath: "photoApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_API_URL }),
    tagTypes: ["Photo"],
    endpoints: (build) => ({
        uploadPhoto: build.mutation<PhotoUploadResponse, PhotoUploadRequest>({
            query: (photoData) => {
                const formData = new FormData();
                formData.append("file", photoData.file);

                if (photoData.latitude !== undefined) {
                    formData.append("latitude", photoData.latitude.toString());
                }
                if (photoData.longitude !== undefined) {
                    formData.append("longitude", photoData.longitude.toString());
                }

                return {
                    url: "upload_photo",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Photo"],
        }),
        processPhoto: build.mutation<ProcessPhotoResponse, number>({
            query: (id) => ({ url: `process_photo?photo_id=${id}`, method: "POST" }),
        }),
        getPhotoStatus: build.query<PhotoStatusResponse, number>({
            query: (id) => `photo_status/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Photo", id }],
        }),
        getPhotoIds: build.query<PhotoIdsResponse, void>({
            query: () => `photo_ids`,
            providesTags: ["Photo"],
        }),
        getPhotosFull: build.query<PhotoItem[], void>({
            query: () => `photos`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Photo" as const, id })),
                          { type: "Photo", id: "LIST" },
                      ]
                    : [{ type: "Photo", id: "LIST" }],
        }),
        updatePhotoStatistics: build.mutation<
            void,
            { id: number; filename?: string; results: PhotoAnnotation[] }
        >({
            query: (payload) => ({
                url: `photo/${payload.id}/statistics`,
                method: "PUT",
                body: { statistics: { filename: payload.filename, results: payload.results } },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "Photo", id }],
        }),
    }),
});

export const {
    useUploadPhotoMutation,
    useProcessPhotoMutation,
    useGetPhotoStatusQuery,
    useGetPhotoIdsQuery,
    useGetPhotosFullQuery,
    useUpdatePhotoStatisticsMutation,
} = photoApi;
