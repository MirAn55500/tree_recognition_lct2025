import { Button, Flex, Form, Input, Typography, Upload } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import type { RcFile, UploadFile } from "antd/es/upload";

import "./CreateResearch.css";

import MessageContext from "@contexts/MessageContext";

import UploaderBody from "@common/Uploader/UploaderBody/UploaderBody";
import { uploaderProps } from "@common/Uploader/props";

import { useProcessPhotoMutation, useUploadPhotoMutation } from "@services/api/photo.api";
import { useCreateResearchMutation } from "@services/api/research.api";
import { type InputGeopositionValue } from "@common/InputGeoposition/InputGeoposition";

const { Title, Link } = Typography;

interface ResearchFormData {
    name: string;
    description?: string;
    photos: UploadFile[];
    geo?: Record<RcFile["uid"], InputGeopositionValue>;
}

const CreateResearch = () => {
    const { messageApi } = useContext(MessageContext);

    const [uploadPhoto] = useUploadPhotoMutation();
    const [processPhoto] = useProcessPhotoMutation();
    const [createResearch] = useCreateResearchMutation();

    const navigate = useNavigate();

    const goBack = () => navigate("/research");

    const onFinish = async (values: ResearchFormData) => {
        try {
            const uploadRequests = values.photos.map(async (photo) =>
                photo.originFileObj
                    ? await uploadPhoto({
                          file: photo.originFileObj,
                          latitude:
                              values?.geo && values.geo[photo.uid] && values.geo[photo.uid][1],
                          longitude:
                              values?.geo && values.geo[photo.uid] && values.geo[photo.uid][0],
                      })
                    : undefined
            );
            const photoIds = (await Promise.all(uploadRequests)).flatMap((result) =>
                result?.data ? result.data.photo_id : []
            );

            await createResearch({
                photo_ids: photoIds,
                name: values.name,
                description: values.description,
            });

            const processRequests = photoIds.map(async (id) => await processPhoto(id));

            await Promise.all(processRequests);

            goBack();
            messageApi?.success("Успешно создано исследование");
        } catch (error) {
            console.error(error);
            messageApi?.error("Ошибка во время создания исследования");
        }
    };

    return (
        <Flex className="page-container">
            <Flex className="create-research-header">
                <Link onClick={goBack}>
                    <ArrowLeftOutlined /> Назад
                </Link>
                <Title level={3}>Новое исследование</Title>
            </Flex>
            <Form<ResearchFormData>
                name="research-create"
                layout="vertical"
                onFinish={onFinish}
                className="create-research-form"
            >
                <Form.Item
                    label="Название исследования"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, введите название исследования!",
                        },
                    ]}
                >
                    <Input placeholder="Введите название исследования" />
                </Form.Item>
                <Form.Item
                    label="Описание исследования"
                    tooltip="Это поле необязательно к заполнению"
                    name="description"
                >
                    <Input.TextArea placeholder="Введите описание исследования" />
                </Form.Item>
                <Form.Item
                    label="Фотографии для исследования"
                    name="photos"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList || []}
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, выберите хотя бы одну фотографию!",
                            validator: (_, value) => {
                                if (!value || value.length === 0) {
                                    return Promise.reject("Выберите хотя бы одну фотографию!");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Upload.Dragger {...uploaderProps("geo")}>
                        <UploaderBody />
                    </Upload.Dragger>
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" type="primary">
                        Создать
                    </Button>
                </Form.Item>
            </Form>
        </Flex>
    );
};

export default CreateResearch;
