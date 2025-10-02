import React from "react";
import { ScrollView, View } from "react-native";
import { useForm } from "react-hook-form";
import { Button, List, Toast } from "@ant-design/react-native";
import { useNavigation } from "@react-navigation/native";

import FormInput from "#common/forms/FormInput/FormInput";
import FormTextarea from "#common/forms/FormTextarea/FormTextarea";
import ImageUploader, { ImageUploaderItem } from "#common/forms/ImageUploader/ImageUploader";

import styles from "./CreateResearchScreen.styles";
import {
    CreateResearchScreenNavigationProp,
    CreateResearchScreenRouteProp,
} from "./CreateResearchScreen.types";

import { useResearchManager } from "hooks/useResearchManager";

type FormData = {
    name: string;
    description?: string;
    photos: ImageUploaderItem[];
};

interface CreateResearchScreenProps {
    route: CreateResearchScreenRouteProp;
}

const CreateResearchScreen: React.FC<CreateResearchScreenProps> = ({ route }) => {
    const navigation = useNavigation<CreateResearchScreenNavigationProp>();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const { createResearchWithPhotos, pendingResearchCount } = useResearchManager();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
            const researchPhotos = data.photos.map((photo) => ({
                file: photo.image.uri,
                latitude: photo.latitude,
                longitude: photo.longitude,
            }));

            const researchData = {
                name: data.name,
                description: data.description || "",
                photo_ids: [],
            };

            const result = await createResearchWithPhotos(researchData, researchPhotos);

            if (result.success) {
                if (result.offline) {
                    Toast.success(
                        `Исследование сохранено локально. Ожидает синхронизации. В очереди: ${
                            pendingResearchCount + 1
                        }`,
                        undefined,
                        undefined,
                        false
                    );
                } else {
                    Toast.success("Исследование успешно создано", undefined, undefined, false);
                }
                navigation.goBack();
            } else {
                Toast.fail("Ошибка при создании исследования", undefined, undefined, false);
            }
        } catch (error) {
            console.error("Error creating research:", error);
            Toast.fail("Произошла ошибка", undefined, undefined, false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView keyboardShouldPersistTaps="always">
                <List renderHeader="Название исследования">
                    <List.Item>
                        <FormInput
                            control={control}
                            errors={errors}
                            name="name"
                            placeholder="Введите название исследования"
                            rules={{
                                required: "Это поле обязательно к заполнению",
                            }}
                        />
                    </List.Item>
                </List>
                <List renderHeader="Описание исследования">
                    <List.Item>
                        <FormTextarea
                            control={control}
                            name="description"
                            placeholder="Введите описание исследования"
                        />
                    </List.Item>
                </List>
                <List renderHeader="Фотографии для исследования">
                    <List.Item>
                        <ImageUploader
                            control={control}
                            errors={errors}
                            name="photos"
                            rules={{
                                required: "Это поле обязательно к заполнению",
                                validate: {
                                    atLeastOne: (value) =>
                                        value?.length > 0 ||
                                        "Необходимо загрузить хотя бы одну фотографию",
                                },
                            }}
                        />
                    </List.Item>
                </List>
            </ScrollView>
            <View style={styles.stickyFooter}>
                <Button
                    type="primary"
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Создание..." : "Создать исследование"}
                </Button>
            </View>
        </View>
    );
};

export default CreateResearchScreen;
