import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "./routes/RootLayout/RootLayout";
import Wrappers from "./routes/Wrappers/Wrappers";

import MapPage from "./routes/MapPage/MapPage";

import ResearchPage from "./routes/ResearchPage/ResearchList/ResearchList";
import CreateResearch from "./routes/ResearchPage/CreateResearch/CreateResearch";
import ResearchView from "./routes/ResearchPage/ResearchView/ResearchView";

import GalleryPage from "./routes/GalleryPage/GalleryMain/GalleryMain";
import UploadPhoto from "./routes/GalleryPage/UploadPhoto/UploadPhoto";

import HomePage from "./routes/HomePage/HomePage";
import ErrorPage from "./routes/ErrorPage/ErrorPage";

import MLOpsLayout from "./routes/MLOpsPage/MLOpsLayout";
import CreateDataset from "./routes/MLOpsPage/Datasets/CreateDateset/CreateDataset";
import Datasets from "./routes/MLOpsPage/Datasets/Datasets";
import DatasetView from "./routes/MLOpsPage/Datasets/DatasetView/DatasetView";
import Annotations from "./routes/MLOpsPage/Annotations/Annotations";
import EditAnnotationPage from "./routes/MLOpsPage/Annotations/EditAnnotation/EditAnnotationPage";
import TrainingPage from "./routes/MLOpsPage/TrainingPage/TrainingPage";
import ModelsPage from "./routes/MLOpsPage/ModelsPage/ModelsPage";

const router = createBrowserRouter([
    {
        element: <Wrappers />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <RootLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />,
                    },
                    {
                        path: "map",
                        element: <MapPage />,
                    },
                    {
                        path: "research",
                        children: [
                            {
                                index: true,
                                element: <ResearchPage />,
                            },
                            {
                                path: "create",
                                element: <CreateResearch />,
                            },
                            {
                                path: ":researchId",
                                element: <ResearchView />,
                            },
                        ],
                    },
                    {
                        path: "gallery",
                        children: [
                            {
                                index: true,
                                element: <GalleryPage />,
                            },
                            {
                                path: "create",
                                element: <UploadPhoto />,
                            },
                        ],
                    },
                    {
                        path: "mlops",
                        element: <MLOpsLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="datasets" />,
                            },
                            {
                                path: "datasets",
                                children: [
                                    {
                                        index: true,
                                        element: <Datasets />,
                                    },
                                    {
                                        path: "create",
                                        element: <CreateDataset />,
                                    },
                                    {
                                        path: ":datasetId",
                                        element: <DatasetView />,
                                    },
                                ],
                            },
                            {
                                path: "annotations",
                                children: [
                                    {
                                        path: ":datasetId?",
                                        element: <Annotations />,
                                    },
                                    {
                                        path: ":datasetId/:photoId",
                                        element: <EditAnnotationPage />,
                                    },
                                ],
                            },
                            {
                                path: "training",
                                children: [
                                    {
                                        path: ":modelId?",
                                        element: <TrainingPage />,
                                    },
                                ],
                            },
                            {
                                path: "models",
                                children: [
                                    {
                                        index: true,
                                        element: <ModelsPage />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;
