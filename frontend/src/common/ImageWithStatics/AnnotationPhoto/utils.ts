import { ShapeType } from "@annotorious/react";

import type { PhotoAnnotation } from "#types/photo";

export const generateAnnotation = (id: number, annotation: PhotoAnnotation) => {
    const [x1, y1, x2, y2] = annotation.bbox;
    const idKey = `${id}-${annotation.bbox.toString()}`;

    return {
        id: idKey,
        bodies: [
            {
                id: "",
                annotation: idKey,
                purpose: "tagging",
                value: JSON.stringify(annotation),
            },
        ],
        target: {
            annotation: idKey,
            selector: {
                type: ShapeType.POLYGON,
                geometry: {
                    bounds: {
                        minX: Math.min(x1, x2),
                        maxX: Math.max(x1, x2),
                        minY: Math.min(y1, y2),
                        maxY: Math.max(y1, y2),
                    },
                    points: [
                        [x1, y1],
                        [x2, y1],
                        [x2, y2],
                        [x1, y2],
                    ],
                },
            },
        },
    };
};
