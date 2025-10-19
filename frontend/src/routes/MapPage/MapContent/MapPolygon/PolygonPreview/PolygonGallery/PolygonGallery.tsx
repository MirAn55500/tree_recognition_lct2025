import Gallery from "@common/Gallery/Gallery";

interface PolygonGalleryProps {
    photoIds?: number[];
}

const PolygonGallery: React.FC<PolygonGalleryProps> = ({ photoIds }) => {
    return <Gallery photosData={photoIds} />;
};

export default PolygonGallery;
