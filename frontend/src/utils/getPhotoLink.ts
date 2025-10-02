const getPhotoLink = (id: number) => {
    return `${import.meta.env.VITE_BACKEND_API_URL}/photo/${id}/file`;
};

export default getPhotoLink;
