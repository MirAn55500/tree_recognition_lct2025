import {
    OpenSeadragonViewer,
    useAnnotator,
    type AnnotoriousOpenSeadragonAnnotator,
} from "@annotorious/react";
import { BorderOutlined, DragOutlined, RetweetOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import "./AnnotationViewer.css";

import getPhotoLink from "@utils/getPhotoLink";

interface AnnotationViewerProps {
    photoId: number;
}

const AnnotationViewer: React.FC<AnnotationViewerProps> = ({ photoId }) => {
    const [mode, setMode] = useState<"move" | "rectangle">("move");
    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

    const viewerOptions = useMemo(
        () => ({
            tileSources: {
                type: "image",
                url: getPhotoLink(photoId),
            },
            prefixUrl: "/openseadragon-images/",
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: false,
            },
        }),
        [photoId]
    );

    const handleMoveMode = () => setMode("move");
    const handleDrawMode = () => setMode("rectangle");
    const handleUpdateAnnotation = useCallback(() => {
        if (!annotator) return;

        const selected = annotator.getSelected();

        annotator.cancelSelected();
        annotator.setSelected(selected.map((item) => item.id));
    }, [annotator]);

    useEffect(() => {
        if (annotator) {
            annotator.setDrawingEnabled(mode === "rectangle");
        }
    }, [annotator, mode]);

    return (
        <div className="osd-container">
            <OpenSeadragonViewer options={viewerOptions} className="osd-viewer" />
            <div className="osd-controls">
                <Button
                    className="osd-control-button"
                    icon={<DragOutlined />}
                    onClick={handleMoveMode}
                    type={mode === "move" ? "primary" : "default"}
                >
                    Перемещение
                </Button>
                <Button
                    className="osd-control-button"
                    icon={<BorderOutlined />}
                    onClick={handleDrawMode}
                    type={mode === "rectangle" ? "primary" : "default"}
                >
                    Прямоугольник
                </Button>
            </div>
            <div className="osd-bottom-controls">
                <Button
                    icon={<RetweetOutlined />}
                    type="primary"
                    onClick={handleUpdateAnnotation}
                    disabled={annotator?.getSelected().length === 0}
                >
                    Обновить аннотацию
                </Button>
            </div>
        </div>
    );
};

export default AnnotationViewer;
