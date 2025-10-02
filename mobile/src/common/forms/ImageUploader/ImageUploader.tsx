import { Button, Toast } from "@ant-design/react-native";
import * as ImagePicker from "expo-image-picker";
import {
    Control,
    Controller,
    FieldErrors,
    FieldValues,
    Path,
    RegisterOptions,
} from "react-hook-form";
import { View, Text } from "react-native";

import ImageSlider from "#common/ImageSlider/ImageSlider";

import styles from "./ImageUploader.styles";
import ErrorText from "../ErrorText/ErrorText";

interface ImageUploaderProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    rules?: RegisterOptions<TFieldValues>;
    errors?: FieldErrors<TFieldValues>;
}

export type ImageUploaderItem = {
    image: ImagePicker.ImagePickerAsset;
    longitude?: number;
    latitude?: number;
};

const ImageUploader = <TFieldValues extends FieldValues>({
    control,
    name,
    rules,
    errors,
}: ImageUploaderProps<TFieldValues>) => {
    const pickImage = (onChange: (value: ImageUploaderItem[]) => void) => async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Toast.fail(
                { content: "Необходимо разрешение на доступ к галерее", position: "top" },
                2
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            onChange(
                result.assets.map((item) => ({
                    image: item,
                    latitude: undefined,
                    longitude: undefined,
                }))
            );
        } else {
            Toast.fail({ content: "Отмена загрузки", position: "top" }, 1);
        }
    };

    const removeImage = (
        images: ImageUploaderItem[],
        index: number,
        onChange: (value: ImageUploaderItem[]) => void
    ) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <>
                    <Button type="primary" size="large" onPress={pickImage(onChange)}>
                        Загрузить
                    </Button>
                    {value && value.length > 0 && (
                        <View style={styles.gridContainer}>
                            <Text style={styles.countText}>Загружено фото: {value.length}</Text>
                            <ImageSlider
                                values={value}
                                onChange={onChange}
                                removeImage={removeImage}
                            />
                        </View>
                    )}
                    {errors && <ErrorText errors={errors} name={name} />}
                </>
            )}
        />
    );
};

export default ImageUploader;
