import { Flex } from "antd";
import { Annotorious } from "@annotorious/react";

import "./ImageWithStatics.css";
import "@annotorious/react/annotorious-react.css";

import ImageWrapper from "./ImageWrapper";

interface ImageWithStaticsProps {
    src: string;
    item: number;
}

const ImageWithStatics: React.FC<ImageWithStaticsProps> = ({ src, item }) => {
    return (
        <Flex className="image-container">
            <Annotorious>
                <ImageWrapper src={src} item={item} />
            </Annotorious>
        </Flex>
    );
};

export default ImageWithStatics;
