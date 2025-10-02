import type { ResearchRaw } from "#types/research";
import type { ResearchPhoto } from "#types/pendingActions";

import { useCreateResearchMutation } from "services/api/research.api";
import { useUploadPhotoMutation, useProcessPhotoMutation } from "services/api/photo.api";
import { addPendingResearch } from "services/slices/onlineStatus.slice";

import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export const useResearchManager = () => {
    const dispatch = useAppDispatch();
    const { isOnline, pendingActions } = useAppSelector((state) => state.onlineStatus);

    const [createResearch] = useCreateResearchMutation();
    const [uploadPhoto] = useUploadPhotoMutation();
    const [processPhoto] = useProcessPhotoMutation();

    const createResearchWithPhotos = async (researchData: ResearchRaw, photos: ResearchPhoto[]) => {
        if (isOnline) {
            try {
                const uploadRequests = photos.map(async (photo) => {
                    const result = await uploadPhoto({
                        file: photo.file,
                        latitude: photo.latitude,
                        longitude: photo.longitude,
                    }).unwrap();
                    return result.photo_id;
                });

                const photoIds = await Promise.all(uploadRequests);

                const processRequests = photoIds.map(id => processPhoto(id));
                await Promise.all(processRequests);

                await createResearch({
                    ...researchData,
                    photo_ids: photoIds,
                }).unwrap();

                return { success: true };
            } catch (error) {
                return { success: false, error };
            }
        } else {
            dispatch(addPendingResearch({ 
                researchData: {
                    ...researchData,
                    photo_ids: [],
                }, 
                photos 
            }));
            return { success: true, offline: true };
        }
    };

    return {
        createResearchWithPhotos,
        pendingResearchCount: pendingActions.length,
    };
};