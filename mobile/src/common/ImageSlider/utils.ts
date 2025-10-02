import { ImageUploaderItem } from "#common/forms/ImageUploader/ImageUploader";
import { PhotoItem } from "#types/photo";

import { Annotation } from "./AnnotatableImageViewer/AnnotatableImageViewer";

export const convertPhotoItemsToAnnotations = (
    photoItems: PhotoItem[]
): { [key: number]: Annotation[] } => {
    return photoItems.reduce((acc, photoItem, photoIndex) => {
        const annotations: Annotation[] =
            photoItem.statistics?.results?.map((annotationData, index) => {
                const [x1, y1, x2, y2] = annotationData.bbox;

                return {
                    id: index,
                    x: x1,
                    y: y1,
                    width: x2 - x1,
                    height: y2 - y1,
                    statistics: annotationData,
                };
            }) || [];

        acc[photoIndex] = annotations;
        return acc;
    }, {} as { [key: number]: Annotation[] });
};

export const isPhotoItem = (item: any): item is PhotoItem => {
    return item && typeof item === "object" && "statistics" in item;
};

export const isImageUploaderItem = (item: any): item is ImageUploaderItem => {
    return item && typeof item === "object" && "image" in item;
};
