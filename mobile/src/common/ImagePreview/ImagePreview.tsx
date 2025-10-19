import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Icon, Text } from "@ant-design/react-native";

import styles from "./ImagePreview.styles";

import { ImageUploaderItem } from "#common/forms/ImageUploader/ImageUploader";
import { isPhotoItem } from "#common/ImageSlider/utils";

import { PhotoItem } from "#types/photo";

import getPhotoLink from "utils/getPhotoLink";

interface ImagePreviewProps {
    image: ImageUploaderItem | PhotoItem;
    index: number;
    onImagePress: (index: number) => void;
    onLocationPress?: (index: number) => void;
    onRemovePress?: () => void;
    showLocationButton: boolean;
    showRemoveButton: boolean;
    size?: { width: number; height: number };
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
    image,
    index,
    onImagePress,
    onLocationPress,
    onRemovePress,
    showLocationButton,
    showRemoveButton,
    size,
}) => {
    const hasLocation = !!(image?.latitude && image?.longitude);

    return (
        <View style={styles.imageCard}>
            <View style={styles.imageWrapper}>
                <TouchableOpacity onPress={() => onImagePress(index)}>
                    <Image
                        source={{
                            uri: isPhotoItem(image) ? getPhotoLink(image.id) : image.image.uri,
                        }}
                        style={size ? [styles.horizontalImage, size] : [styles.horizontalImage]}
                    />
                </TouchableOpacity>

                {/* {showLocationButton && onLocationPress && (
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => onLocationPress(index)}
                    >
                        <Text style={styles.locationButtonText}>
                            <Icon name="global" color={hasLocation ? "#0000ffff" : "#818181ff"} />
                        </Text>
                    </TouchableOpacity>
                )} */}

                {showRemoveButton && onRemovePress && (
                    <TouchableOpacity style={styles.removeButton} onPress={onRemovePress}>
                        <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ImagePreview;
