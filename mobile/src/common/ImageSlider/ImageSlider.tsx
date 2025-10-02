import { ScrollView, View, Modal, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { Icon } from "@ant-design/react-native";

import styles from "./ImageSlider.styles";

import LocationPickerModal, {
    LocationPickerType,
} from "#common/LocationPickerModal/LocationPickerModal";
import { ImageUploaderItem } from "#common/forms/ImageUploader/ImageUploader";
import ImagePreview from "#common/ImagePreview/ImagePreview";
import AnnotatableImageViewer from "#common/ImageSlider/AnnotatableImageViewer/AnnotatableImageViewer";

import { PhotoItem } from "#types/photo";

import EmptySlider from "./EmptySlider/EmptySlider";

import { isImageUploaderItem, isPhotoItem, convertPhotoItemsToAnnotations } from "./utils";
import getPhotoLink from "utils/getPhotoLink";
import getAnnotatedPhotoLink from "utils/getAnnotatedPhotoLink";

interface ImageSliderProps {
    values: ImageUploaderItem[] | PhotoItem[];
    onChange?: (values: ImageUploaderItem[]) => void;
    removeImage?: (
        value: ImageUploaderItem[],
        index: number,
        onChange: (values: ImageUploaderItem[]) => void
    ) => void;
    display?: "grid" | "scroll";
}

const ImageSlider: React.FC<ImageSliderProps> = ({
    values,
    removeImage,
    onChange,
    display = "scroll",
}) => {
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImageForLocation, setCurrentImageForLocation] = useState<number | null>(null);

    const openLocationPicker = (index: number) => {
        setCurrentImageForLocation(index);
        setLocationModalVisible(true);
    };

    const closeLocationPicker = () => {
        setLocationModalVisible(false);
        setCurrentImageForLocation(null);
    };

    const openImagePreview = (index: number) => {
        setCurrentImageIndex(index);
        setPreviewModalVisible(true);
    };

    const closeImagePreview = () => {
        setPreviewModalVisible(false);
    };

    const handleLocationSelect = (location: LocationPickerType) => {
        if (
            currentImageForLocation !== null &&
            values.every((value) => isImageUploaderItem(value)) &&
            onChange
        ) {
            const valuesBefore = values.slice(0, currentImageForLocation);
            const valuesAfter = values.slice(currentImageForLocation + 1);
            const newValue = {
                ...values[currentImageForLocation],
                latitude: location?.latitude,
                longitude: location?.longitude,
            };

            onChange([...valuesBefore, newValue, ...valuesAfter]);
        }

        closeLocationPicker();
    };

    const goToNextImage = () => {
        if (currentImageIndex < values.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const goToPrevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const handleChangeIndex = (value?: number) => {
        if (value !== undefined) {
            setCurrentImageIndex(value);
        }
    };

    const imageUrls = values.map((value) => ({
        url: isPhotoItem(value)
            ? value.statistics?.results && value.statistics?.results.length > 0
                ? getAnnotatedPhotoLink(value.id)
                : getPhotoLink(value.id)
            : value.image.uri,
    }));

    const annotations = values.every(isPhotoItem)
        ? convertPhotoItemsToAnnotations(values as PhotoItem[])
        : [];

    if (values.length === 0) {
        return <EmptySlider />;
    }

    return (
        <>
            {display === "scroll" && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.horizontalContainer}>
                        {values.map((image, index) => (
                            <ImagePreview
                                key={index}
                                image={image}
                                index={index}
                                onImagePress={openImagePreview}
                                onLocationPress={openLocationPicker}
                                onRemovePress={
                                    removeImage && onChange && values.every(isImageUploaderItem)
                                        ? () => removeImage(values, index, onChange)
                                        : undefined
                                }
                                showLocationButton={!!removeImage && !!onChange}
                                showRemoveButton={
                                    values.every(isImageUploaderItem) && !!removeImage && !!onChange
                                }
                            />
                        ))}
                    </View>
                </ScrollView>
            )}
            {display === "grid" && (
                <ScrollView contentContainerStyle={styles.gridContainer}>
                    <View style={styles.grid}>
                        {values.map((item, index) => (
                            <TouchableOpacity onPress={() => openImagePreview(index)} key={index}>
                                <Image
                                    src={getPhotoLink((item as PhotoItem).id)}
                                    style={{ width: 100, height: 100 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            <LocationPickerModal
                visible={locationModalVisible}
                onClose={closeLocationPicker}
                onLocationSelect={handleLocationSelect}
            />

            {/* <Modal visible={previewModalVisible} onRequestClose={closeImagePreview}>
                <WebView source={{ uri: "http://51.250.113.243/research/2" }} style={{ flex: 1 }} />
            </Modal> */}

            <Modal
                visible={previewModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImagePreview}
            >
                <View style={styles.modalContainer}>
                    <AnnotatableImageViewer
                        onChangeIndex={handleChangeIndex}
                        values={imageUrls}
                        selectedImageIndex={currentImageIndex}
                        annotations={annotations}
                    />

                    {currentImageIndex > 0 && (
                        <TouchableOpacity
                            style={styles.leftArrow}
                            onPress={goToPrevImage}
                            activeOpacity={0.7}
                        >
                            <Icon name="left" color="rgba(255,255,255,0.8)" size="lg" />
                        </TouchableOpacity>
                    )}

                    {currentImageIndex < values.length - 1 && (
                        <TouchableOpacity
                            style={styles.rightArrow}
                            onPress={goToNextImage}
                            activeOpacity={0.7}
                        >
                            <Icon name="right" color="rgba(255,255,255,0.8)" size="lg" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={closeImagePreview}>
                        <Icon name="close" color="rgba(255,255,255,0.8)" size="lg" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

export default ImageSlider;
