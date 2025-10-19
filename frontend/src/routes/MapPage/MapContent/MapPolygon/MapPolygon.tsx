import { Polygon } from "@pbe/react-yandex-maps";
import { useContext } from "react";

import PolygonPreview from "./PolygonPreview/PolygonPreview";

import ModalContext from "@contexts/ModalContext";

import type { MapArea } from "#types/map";

interface MapPolygonProps {
    item: MapArea;
}

const MapPolygon: React.FC<MapPolygonProps> = ({
    item: { area_id, coordinates, area_name, type },
}) => {
    const { open } = useContext(ModalContext);

    const handlePolygonClick = (areaId: number, areaName: string) => {
        open({
            content: <PolygonPreview areaId={areaId} areaName={areaName} />,
            props: {
                title: `Просмотр области "${areaName}"`,
                footer: <></>,
                className: "modal-polygon-preview",
                fullHeight: true,
            },
        });
    };

    return (
        <>
            {(type === "MultiPolygon" ? coordinates : [coordinates]).map((coord, index) => (
                <Polygon
                    options={{
                        fillColor: "#1bad03",
                        strokeColor: "#094200ff",
                        opacity: 0.5,
                    }}
                    properties={{}}
                    geometry={coord}
                    key={`${area_id}-${index}`}
                    onClick={() => handlePolygonClick(area_id, area_name)}
                />
            ))}
        </>
    );
};

export default MapPolygon;
