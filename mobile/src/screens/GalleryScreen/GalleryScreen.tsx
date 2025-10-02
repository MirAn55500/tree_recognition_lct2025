import React from "react";

import { useGetPhotosFullQuery } from "services/api/photo.api";

import EmptySlider from "#common/ImageSlider/EmptySlider/EmptySlider";
import ImageSlider from "#common/ImageSlider/ImageSlider";

const GalleryScreen = () => {
    const { data: photos } = useGetPhotosFullQuery();

    return (
        <>
            {!photos || photos.length === 0 ? (
                <EmptySlider />
            ) : (
                <ImageSlider values={photos} display="grid" />
            )}
        </>
    );
};

export default GalleryScreen;
