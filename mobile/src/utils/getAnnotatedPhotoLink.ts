import Constants from "expo-constants";

const getAnnotatedPhotoLink = (id: number) => {
    return `${
        Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL
    }/photo/${id}/draw_boxes`;
};

export default getAnnotatedPhotoLink;
