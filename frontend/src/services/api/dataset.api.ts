import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { DatasetRaw, Dataset, AttachPhotoToDataset, DatasetWithPhotos } from "#types/dataset";

export const datasetApi = createApi({
    reducerPath: "datasetApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_API_URL }),
    tagTypes: ["Dataset"],
    endpoints: (build) => ({
        getDatasets: build.query<Dataset[], void>({
            query: () => `datasets`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Dataset" as const, id })),
                          { type: "Dataset", id: "LIST" },
                      ]
                    : [{ type: "Dataset", id: "LIST" }],
        }),
        createDataset: build.mutation<Dataset, DatasetRaw>({
            query: (body) => ({ url: `create_dataset`, method: "POST", body }),
            invalidatesTags: [{ type: "Dataset", id: "LIST" }],
        }),
        attachPhotoToDataset: build.mutation<void, AttachPhotoToDataset>({
            query: (body) => ({ url: `dataset/add_photo`, method: "POST", body }),
            invalidatesTags: (_result, _error, { dataset_id }) => [
                { type: "Dataset", id: dataset_id },
            ],
        }),
        getDataset: build.query<DatasetWithPhotos, number>({
            query: (id) => `dataset/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Dataset", id }],
        }),
        trainDataset: build.mutation<void, number>({
            query: (id) => ({ url: `dataset/${id}/train`, method: "POST" }),
        }),
    }),
});

export const {
    useGetDatasetsQuery,
    useCreateDatasetMutation,
    useAttachPhotoToDatasetMutation,
    useGetDatasetQuery,
    useTrainDatasetMutation,
} = datasetApi;
