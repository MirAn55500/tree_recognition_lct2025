import Constants from "expo-constants";

const getPhotoLink = (id: number) => {
    return `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}/photo/${id}/file`;
};

export default getPhotoLink;
