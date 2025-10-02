import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./routes/RootLayout/RootLayout";
import Wrappers from "./routes/Wrappers/Wrappers";

import MapPage from "./routes/MapPage/MapPage";

import ResearchPage from "./routes/ResearchPage/ResearchList/ResearchList";
import CreateResearch from "./routes/ResearchPage/CreateResearch/CreateResearch";

import GalleryPage from "./routes/GalleryPage/Gallery/Gallery";
import ResearchView from "./routes/ResearchPage/ResearchView/ResearchView";
import UploadPhoto from "./routes/GalleryPage/UploadPhoto/UploadPhoto";
import HomePage from "./routes/HomePage/HomePage";

const router = createBrowserRouter([
    {
        element: <Wrappers />,
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
                ],
            },
        ],
    },
]);

export default router;
