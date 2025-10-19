import ImageWithStatics from "@common/ImageWithStatics/ImageWithStatics";
import Grid from "@common/Grid/Grid";

import getPhotoLink from "@utils/getPhotoLink";

import type { PhotoItem } from "#types/photo";

import "./Gallery.css";

interface GalleryProps {
    photosData?: PhotoItem[] | number[];
    className?: string;
}

const Gallery: React.FC<GalleryProps> = ({ photosData, className }) => {
    return (
        <Grid<number | PhotoItem>
            data={photosData}
            className={`gallery-wrapper ${className ?? ""}`}
            render={(photoItem) => {
                const id = typeof photoItem === "number" ? photoItem : photoItem.id;

                return <ImageWithStatics src={getPhotoLink(id)} item={id} />;
            }}
        />
    );
};

export default Gallery;
