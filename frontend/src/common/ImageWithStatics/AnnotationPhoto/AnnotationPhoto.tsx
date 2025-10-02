import {
    OpenSeadragonAnnotationPopup,
    OpenSeadragonAnnotator,
    OpenSeadragonViewer,
    useAnnotator,
    UserSelectAction,
    type AnnotoriousOpenSeadragonAnnotator,
} from "@annotorious/react";
import type React from "react";
import { useEffect, useMemo } from "react";

import "@annotorious/react/annotorious-react.css";

import type { PhotoStatistics } from "#types/photo";

import { generateAnnotation } from "./utils";
import AnnotationPopup from "./AnnotationPopup/AnnotationPopup";

interface AnnotationPhotoProps {
    src: string;
    statistics?: PhotoStatistics | null;
    id: number;
}

const AnnotationPhoto: React.FC<AnnotationPhotoProps> = ({ src, statistics, id }) => {
    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();
    const viewerOptions = useMemo(
        () => ({
            tileSources: {
                type: "image",
                url: src,
            },
            prefixUrl: "/openseadragon-images/",
        }),
        [src]
    );

    useEffect(() => {
        console.log(statistics?.results);
        if (annotator && statistics && statistics.results) {
            annotator.setAnnotations(
                statistics.results.flatMap((annotation) => generateAnnotation(id, annotation)),
                true
            );

            console.log("GOT", annotator.getAnnotations());
        }
    }, [annotator, statistics]);

    return (
        <>
            <OpenSeadragonAnnotator
                drawingEnabled={false}
                userSelectAction={UserSelectAction.SELECT}
            >
                <OpenSeadragonViewer options={viewerOptions} className="osd" />
                <OpenSeadragonAnnotationPopup popup={(props) => <AnnotationPopup {...props} />} />
            </OpenSeadragonAnnotator>
        </>
    );
};

export default AnnotationPhoto;
