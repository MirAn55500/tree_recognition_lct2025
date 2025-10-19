import React, { useState, useRef, useCallback } from "react";
import { View, Image, Modal, ScrollView, TouchableOpacity, Text } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

import { PhotoAnnotation } from "#types/photo";

import styles from "./AnnotatableImageViewer.styles";
import AnnotationStatistics from "./AnnotationStatistics/AnnotationStatistics";

export interface Annotation {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    statistics: PhotoAnnotation;
}

interface AnnotatableImageViewerProps {
    values: Array<string | { url: string }>;
    selectedImageIndex: number;
    onChangeIndex: (value?: number) => void;
    annotations: { [key: number]: Annotation[] };
}

const AnnotatableImageViewer: React.FC<AnnotatableImageViewerProps> = ({
    values,
    selectedImageIndex,
    onChangeIndex,
    annotations = {},
}) => {
    const viewerRef = useRef<any>(null);
    const [selectedAnnotation, setSelectedAnnotation] = useState<PhotoAnnotation | null>(null);

    const renderImage = useCallback(
        (props: {
            source: { uri: string };
            style: { height: number; width: number };
            index?: number;
        }) => {
            const currentIndex = props.index ?? selectedImageIndex;

            return (
                <View style={[styles.container, props.style]}>
                    <Image
                        source={props.source}
                        style={[styles.imageWrapper, props.style]}
                        resizeMode="contain"
                    />
                </View>
            );
        },
        [selectedImageIndex, annotations]
    );

    const imageUrls = values.map((value) => ({
        url: typeof value === "string" ? value : value.url,
    }));

    const currentAnnotations = annotations[selectedImageIndex] || [];

    return (
        <View style={styles.mainContainer}>
            <View style={styles.imageContainer}>
                <ImageViewer
                    ref={viewerRef}
                    index={selectedImageIndex}
                    imageUrls={imageUrls}
                    renderImage={renderImage}
                    onChange={onChangeIndex}
                    enableSwipeDown={true}
                    saveToLocalByLongPress={false}
                />
            </View>

            <View style={styles.annotationsContainer}>
                {currentAnnotations.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.annotationsScrollContent}
                    >
                        {currentAnnotations.map((annotation, index) => (
                            <TouchableOpacity
                                key={annotation.id}
                                style={styles.annotationCard}
                                onPress={() => setSelectedAnnotation(annotation.statistics)}
                            >
                                <AnnotationStatistics
                                    statistics={annotation.statistics}
                                    compact={true}
                                    index={index + 1}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.noAnnotations}>
                        <Text style={styles.noAnnotationsText}>
                            Нет аннотаций для этого изображения
                        </Text>
                    </View>
                )}
            </View>

            <Modal
                visible={!!selectedAnnotation}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedAnnotation(null)}
            >
                {selectedAnnotation && (
                    <AnnotationStatistics
                        hideAnnotationModal={() => setSelectedAnnotation(null)}
                        statistics={selectedAnnotation}
                    />
                )}
            </Modal>
        </View>
    );
};

export default AnnotatableImageViewer;
