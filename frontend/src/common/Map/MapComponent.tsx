import { useEffect, useState } from "react";
import { createTerraDrawWithUI, type UiControlType } from "@2gis/mapgl-terra-draw";
import { hexGrid, type Units } from "@turf/turf";
import { load } from "@2gis/mapgl";
import type { Map } from "@2gis/mapgl/types";
import type { BBox, Feature, Polygon } from "geojson";
import type { GeoJSONStoreFeatures } from "terra-draw";

import "@2gis/mapgl-terra-draw/dist/mapgl-terra-draw.css";
import "./MapComponent.css";

import MapWrapper from "./MapWrapper";

interface MapComponentProps {
    grid?: {
        bbox: BBox;
        cellSide: number;
        options?: {
            units?: Units;
            triangles?: boolean;
            mask?: Feature<Polygon>;
        };
        color: string;
        strokeColor: string;
    };
    center?: [number, number];
    zoom?: number;
    controls?: UiControlType[];
    handleChanges?: (changes?: GeoJSONStoreFeatures) => void;
    initFeatures?: GeoJSONStoreFeatures[];
}

const MapComponent: React.FC<MapComponentProps> = ({
    grid,
    center,
    zoom,
    controls,
    handleChanges,
    initFeatures,
}) => {
    const [map, setMap] = useState<Map | undefined>(undefined);

    useEffect(() => {
        load().then((mapglAPI) => {
            const mapInstance = new mapglAPI.Map("map-container", {
                center: center || [37.623879, 55.751115],
                zoom: zoom || 11,
                key: import.meta.env.VITE_2GIS_API_KEY,
            });

            setMap(mapInstance);

            mapInstance.on("styleload", () => {
                const { draw } = createTerraDrawWithUI({
                    map: mapInstance,
                    mapgl: mapglAPI,
                    controls: [],
                });

                if (controls && controls.length > 0) {
                    draw.setMode(controls[0]);
                }

                if (initFeatures) {
                    draw.addFeatures(initFeatures);
                }

                draw.on(
                    "change",
                    (featureIds) =>
                        handleChanges &&
                        featureIds.map((featureId) =>
                            handleChanges(draw.getSnapshotFeature(featureId))
                        )
                );

                if (grid) {
                    const createdGrid = hexGrid(grid.bbox, grid.cellSide, grid.options);
                    //     [37.3, 55.55, 37.9, 56], 1, {
                    //     units: "kilometres",

                    createdGrid.features.forEach((hexagon) => {
                        new mapglAPI.Polygon(mapInstance, {
                            coordinates: hexagon.geometry.coordinates,
                            // color: "#ff55002d",
                            color: grid.color,
                            strokeWidth: 1,
                            // strokeColor: "#ff000026",
                            strokeColor: grid.strokeColor,
                        });
                    });
                }
            });
        });

        return () => map?.destroy();
    }, []);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <MapWrapper />
        </div>
    );
};

export default MapComponent;
