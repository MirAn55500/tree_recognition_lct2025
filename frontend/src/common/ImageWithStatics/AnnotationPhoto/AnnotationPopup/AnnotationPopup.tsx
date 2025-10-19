import type { PopupProps } from "@annotorious/react";

import StatisticsCard from "@common/StatisticsCard/StatisticsCard";

import type { PhotoAnnotation } from "#types/photo";

const AnnotationPopup: React.FC<PopupProps> = ({ annotation }) => {
    const tagging = annotation.bodies.find((body) => body.purpose === "tagging");
    const response: PhotoAnnotation | undefined = tagging?.value
        ? JSON.parse(tagging.value)
        : undefined;

    return <StatisticsCard data={response} />;
};

export default AnnotationPopup;
