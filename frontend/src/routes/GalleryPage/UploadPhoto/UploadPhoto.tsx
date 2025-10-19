import { Button, Flex, Form, Typography, Upload, type UploadFile } from "antd";
import type { RcFile } from "antd/es/upload";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

import "./UploadPhoto.css";

import { uploaderProps } from "@common/Uploader/props";
import UploaderBody from "@common/Uploader/UploaderBody/UploaderBody";
import { type InputGeopositionValue } from "@common/InputGeoposition/InputGeoposition";

import MessageContext from "@contexts/MessageContext";

import { useProcessPhotoMutation, useUploadPhotoMutation } from "@services/api/photo.api";

const { Link, Title } = Typography;

interface UploadPhotoForm {
    photos: UploadFile[];
    geo?: Record<RcFile["uid"], InputGeopositionValue>;
}

const UploadPhoto = () => {
    const { messageApi } = useContext(MessageContext);

    const [uploadPhoto] = useUploadPhotoMutation();
    const [processPhoto] = useProcessPhotoMutation();

    const navigate = useNavigate();

    const goBack = () => navigate("/gallery");

    const onFinish = async (values: UploadPhotoForm) => {
        try {
            const uploadRequests = values.photos.map(async (photo) =>
                photo.originFileObj
                    ? await uploadPhoto({
                          file: photo.originFileObj,
                          latitude: values?.geo && values.geo[photo.uid][1],
                          longitude: values?.geo && values.geo[photo.uid][0],
                      })
                    : undefined
            );
            const photoIds = (await Promise.all(uploadRequests)).flatMap((result) =>
                result?.data ? result.data.photo_id : []
            );

            const processRequests = photoIds.map(async (id) => await processPhoto(id));

            await Promise.all(processRequests);

            goBack();
            messageApi?.success("Успешно загружено");
        } catch (error) {
            console.error(error);
            messageApi?.error("Ошибка во время загрузки");
        }
    };

    return (
        <Flex className="page-container">
            <Flex className="create-research-header">
                <Link onClick={goBack}>
                    <ArrowLeftOutlined /> Назад
                </Link>
                <Title level={3}>Загрузка фотографий</Title>
            </Flex>
            <Form<UploadPhotoForm>
                name="upload-photo"
                layout="vertical"
                onFinish={onFinish}
                className="upload-photo-form"
            >
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
                    <Button htmlType="submit" type="primary" className="upload-photo-submit">
                        Создать
                    </Button>
                </Form.Item>
            </Form>
        </Flex>
    );
};

export default UploadPhoto;
