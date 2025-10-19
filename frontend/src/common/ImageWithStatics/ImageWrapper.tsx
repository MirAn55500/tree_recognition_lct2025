import { Image } from "antd";

import AnnotationPhoto from "./AnnotationPhoto/AnnotationPhoto";

import { useGetPhotoStatusQuery } from "@services/api/photo.api";
import type React from "react";
import { useAnnotator, type AnnotoriousOpenSeadragonAnnotator } from "@annotorious/react";

interface ImageWrapperProps {
    src: string;
    item: number;
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({ src, item }) => {
    const { data: photoStatus } = useGetPhotoStatusQuery(item, {
        refetchOnMountOrArgChange: true,
    });
    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

    return (
        <Image
            preview={{
                imageRender: () => (
                    <AnnotationPhoto src={src} statistics={photoStatus?.statistics} id={item} />
                ),
                toolbarRender: () => <></>,
                onVisibleChange: (value, prevValue) => {
                    console.log(value, prevValue, annotator);
                    annotator?.cancelSelected();
                },
            }}
            src={src}
        />
    );
};

export default ImageWrapper;
