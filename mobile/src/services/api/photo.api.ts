import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";

import type {
    PhotoIdsResponse,
    PhotoItem,
    PhotoStatusResponse,
    PhotoUploadRequest,
    PhotoUploadResponse,
    ProcessPhotoResponse,
} from "#types/photo";

export const photoApi = createApi({
    reducerPath: "photoApi",
    baseQuery: fetchBaseQuery({
        baseUrl: Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL,
    }),
    tagTypes: ["Photo"],
    endpoints: (build) => ({
        uploadPhoto: build.mutation<PhotoUploadResponse, PhotoUploadRequest>({
            query: (photoData) => {
                const formData = new FormData();
                formData.append("file", {
                    uri: photoData.file,
                    type: "image/jpeg",
                    name: `image_${Date.now()}.jpg`,
                } as any);

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
        }),
        getPhotoIds: build.query<PhotoIdsResponse, void>({
            query: () => `photo_ids`,
            providesTags: ["Photo"],
        }),
        getPhotosFull: build.query<PhotoItem[], void>({
            query: () => `photos`,
        }),
    }),
});

export const {
    useUploadPhotoMutation,
    useProcessPhotoMutation,
    useGetPhotoStatusQuery,
    useGetPhotoIdsQuery,
    useGetPhotosFullQuery,
} = photoApi;
