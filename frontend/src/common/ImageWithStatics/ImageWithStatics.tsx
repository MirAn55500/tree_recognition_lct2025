import { Flex, Image } from "antd";
import { Annotorious } from "@annotorious/react";

import "./ImageWithStatics.css";
import "@annotorious/react/annotorious-react.css";

import AnnotationPhoto from "./AnnotationPhoto/AnnotationPhoto";
import { useGetPhotoStatusQuery } from "@services/api/photo.api";

interface ImageWithStaticsProps {
    src: string;
    item: number;
}

const ImageWithStatics: React.FC<ImageWithStaticsProps> = ({ src, item }) => {
    const { data: photoStatus } = useGetPhotoStatusQuery(item, {
        refetchOnMountOrArgChange: true,
    });

    return (
        <Flex className="image-container">
            <Image
                preview={{
                    imageRender: () => (
                        <Annotorious>
                            <AnnotationPhoto
                                src={src}
                                statistics={photoStatus?.statistics}
                                id={item}
                            />
                        </Annotorious>
                    ),
                    toolbarRender: () => <></>,
                }}
                src={src}
            />
        </Flex>
    );
};

export default ImageWithStatics;
