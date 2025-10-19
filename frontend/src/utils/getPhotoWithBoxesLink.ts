const getPhotoWithBoxesLink = (id: number) => {
    return `${import.meta.env.VITE_BACKEND_API_URL}/photo/${id}/draw_boxes`;
};

export default getPhotoWithBoxesLink;
