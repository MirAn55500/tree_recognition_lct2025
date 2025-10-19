import { Button, FullscreenControl, ZoomControl } from "@pbe/react-yandex-maps";

import type { MapLayers } from "../MapPage";
import type React from "react";

interface MapToolbarProps {
    selectedLayer: MapLayers;
    selectLayer: (newValue: MapLayers) => void;
}

const layersSchema: {
    content: string;
    key: MapLayers;
}[] = [
    {
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="vertical-align: middle;" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.3 1.3 0 0 0-.37.265.3.3 0 0 0-.057.09V14l.002.008.016.033a.6.6 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.6.6 0 0 0 .146-.15l.015-.033L12 14v-.004a.3.3 0 0 0-.057-.09 1.3 1.3 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411"/></svg>',
        key: "points",
    },
    {
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="vertical-align: middle;" viewBox="0 0 16 16"><path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0zM8 9.433 1.562 6 8 2.567 14.438 6z"/></svg>',
        key: "polygons",
    },
];

const MapToolbar: React.FC<MapToolbarProps> = ({ selectedLayer, selectLayer }) => {
    return (
        <>
            {layersSchema.map((layer) => (
                <Button
                    data={{ content: layer.content }}
                    options={{ selectOnClick: false }}
                    onClick={() => selectLayer(layer.key)}
                    state={{ selected: selectedLayer === layer.key }}
                    key={layer.key}
                />
            ))}
            <ZoomControl />
            <FullscreenControl />
        </>
    );
};

export default MapToolbar;
