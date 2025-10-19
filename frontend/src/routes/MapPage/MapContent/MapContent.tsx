import { Clusterer, Placemark } from "@pbe/react-yandex-maps";
import { useContext } from "react";

import "./MapContent.css";

import PointPreview from "./PointPreview/PointPreview";
import MapPolygon from "./MapPolygon/MapPolygon";

import { useGetAreasQuery, useGetPointsQuery } from "@services/api/map.api";
import ModalContext from "@contexts/ModalContext";

import type { PhotoStatistics } from "#types/photo";

interface MapContentProps {
    dataType: "points" | "polygons";
}

const MapContent: React.FC<MapContentProps> = ({ dataType }) => {
    const { open } = useContext(ModalContext);

    const { data: polygonsData } = useGetAreasQuery();
    const { data: pointsData } = useGetPointsQuery();

    const handlePointClick = (photoId: number, statistics?: PhotoStatistics) => {
        open({
            content: <PointPreview id={photoId} statistics={statistics} />,
            props: {
                title: "Просмотр точки",
                footer: <></>,
                className: "modal-point-preview",
                fullHeight: true,
            },
        });
    };

    return (
        <>
            {dataType === "polygons" &&
                polygonsData &&
                polygonsData.map((item) => <MapPolygon item={item} key={item.area_id} />)}
            {dataType === "points" && pointsData && (
                <Clusterer
                    options={{
                        preset: "islands#darkGreenClusterIcons",
                        groupByCoordinates: false,
                    }}
                >
                    {pointsData.map((item) => (
                        <Placemark
                            geometry={[item.latitude, item.longitude]}
                            options={{ preset: "islands#darkGreenVegetationIcon" }}
                            key={item.photo_id}
                            onClick={() =>
                                handlePointClick(item.photo_id, item.statistics || undefined)
                            }
                        />
                    ))}
                </Clusterer>
            )}
        </>
    );
};

export type { MapContentProps };
export default MapContent;
