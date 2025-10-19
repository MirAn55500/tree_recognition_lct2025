import { YMaps, Map } from "@pbe/react-yandex-maps";
import { useState } from "react";

import "./MapPage.css";

import MapContent from "./MapContent/MapContent";
import MapToolbar from "./MapToolbar/MapToolbar";

type MapLayers = "polygons" | "points";

const MapPage = () => {
    const defaultState = {
        center: [55.751115, 37.623879],
        zoom: 11,
    };

    const [selectedLayer, setSelectedLayer] = useState<MapLayers>("polygons");

    return (
        <div className="map-wrapper">
            <YMaps>
                <Map defaultState={defaultState} className="map">
                    <MapToolbar selectLayer={setSelectedLayer} selectedLayer={selectedLayer} />
                    <MapContent dataType={selectedLayer} />
                </Map>
            </YMaps>
        </div>
    );
};

export type { MapLayers };
export default MapPage;
