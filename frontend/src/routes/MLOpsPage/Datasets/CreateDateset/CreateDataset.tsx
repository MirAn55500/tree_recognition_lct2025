import { Button, Flex, Form, Input, message, Typography, Upload } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { UploadFile } from "antd/es/upload";

import "./CreateDataset.css";

import UploaderBody from "@common/Uploader/UploaderBody/UploaderBody";
import { uploaderProps } from "@common/Uploader/props";

import {
    useGetPhotoIdsQuery,
    useProcessPhotoMutation,
    useUploadPhotoMutation,
} from "@services/api/photo.api";
import {
    useAttachPhotoToDatasetMutation,
    useCreateDatasetMutation,
} from "@services/api/dataset.api";

import MultiplePhotoSelect from "./MultiplePhotoSelect/MultiplePhotoSelect";

const { Title, Link } = Typography;

interface ResearchFormData {
    name: string;
    description?: string;
    photos?: UploadFile[];
    galleryPhotos?: number[];
}

const CreateDataset = () => {
    const [uploadPhoto] = useUploadPhotoMutation();
    const [createDataset] = useCreateDatasetMutation();
    const [attachPhoto] = useAttachPhotoToDatasetMutation();
    const [processPhoto] = useProcessPhotoMutation();
    const { data: photoIds } = useGetPhotoIdsQuery();

    const navigate = useNavigate();
    const [form] = Form.useForm<ResearchFormData>();

    const goBack = () => navigate("/mlops/datasets");

    const onFinish = async (values: ResearchFormData) => {
        try {
            const uploadRequests = (values?.photos ?? []).map(async (photo) =>
                photo.originFileObj
                    ? await uploadPhoto({
                          file: photo.originFileObj,
                      })
                    : undefined
            );
            const photoIds = (await Promise.all(uploadRequests)).flatMap((result) =>
                result?.data ? result.data.photo_id : []
            );

            const { data: dataset } = await createDataset({
                name: values.name,
                description: values.description,
            });

            if (!dataset) {
                message.error("Ошибка во время создания датасета");
                return;
            }

            const processRequests = photoIds
                .map((item) => ({ id: item, exist: false }))
                .concat((values?.galleryPhotos ?? []).map((item) => ({ id: item, exist: true })))
                .flatMap(async ({ id, exist }) => {
                    if (!exist) {
                        return [
                            await attachPhoto({
                                photo_id: id,
                                dataset_id: dataset.id,
                            }),
                            await processPhoto(id),
                        ];
                    }

                    return [
                        await attachPhoto({
                            photo_id: id,
                            dataset_id: dataset.id,
                        }),
                    ];
                });

            await Promise.all(processRequests);

            goBack();
            message.success("Успешно создан датасет");
        } catch (error) {
            console.error(error);
            message.error("Ошибка во время создания датасета");
        }
    };

    return (
        <>
            <Flex className="create-dataset-header">
                <Link onClick={goBack}>
                    <ArrowLeftOutlined /> Назад
                </Link>
                <Title level={3}>Новый датасет</Title>
            </Flex>
            <Form<ResearchFormData>
                form={form}
                name="dataset-create"
                layout="vertical"
                onFinish={onFinish}
                className="create-dataset-form"
            >
                <Form.Item
                    label="Название датасета"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, введите название датасета!",
                        },
                    ]}
                >
                    <Input placeholder="Введите название датасета" />
                </Form.Item>
                <Form.Item
                    label="Описание датасета"
                    tooltip="Это поле необязательно к заполнению"
                    name="description"
                >
                    <Input.TextArea placeholder="Введите описание датасета" />
                </Form.Item>
                <Form.Item
                    label="Фотографии для датасета"
                    name="photos"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList || []}
                    tooltip="Требуется хотя бы одна фотография - из этого или следующего поля"
                    dependencies={["galleryPhotos"]}
                    rules={[
                        {
                            validator: async (_, value) => {
                                const photosList = value || [];
                                const gallery = form.getFieldValue("galleryPhotos") || [];
                                if ((photosList.length || gallery.length) > 0)
                                    return Promise.resolve();
                                return Promise.reject(
                                    new Error(
                                        "Пожалуйста, добавьте хотя бы одну фотографию (загрузите или выберите из галереи)"
                                    )
                                );
                            },
                        },
                    ]}
                >
                    <Upload.Dragger {...uploaderProps()}>
                        <UploaderBody />
                    </Upload.Dragger>
                </Form.Item>
                <Form.Item
                    label="Фотографии из галереи"
                    name="galleryPhotos"
                    tooltip="Требуется хотя бы одна фотография - из этого или предыдущего поля"
                >
                    <MultiplePhotoSelect
                        photoIds={photoIds?.photo_ids.map((item) => item.id) ?? []}
                    />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" type="primary">
                        Создать
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default CreateDataset;
