import { DeleteOutlined, FileImageOutlined } from "@ant-design/icons";
import { Button, Flex, Form, message, Typography, Upload, type UploadProps } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload";

import InputGeoposition from "@common/InputGeoposition/InputGeoposition";

const { Text } = Typography;

const beforeUpload = (_file: RcFile, fileList: RcFile[]) => {
    const invalidFiles = fileList.filter((f) => {
        const isImage = f.type.startsWith("image/");
        const isLt30M = f.size / 1024 / 1024 < 30;
        return !isImage || !isLt30M;
    });

    if (invalidFiles.length > 0) {
        invalidFiles.forEach((invalidFile) => {
            const isImage = invalidFile.type.startsWith("image/");

            if (!isImage) {
                message.error(`Файл "${invalidFile.name}" не является изображением!`);
            } else {
                message.error(`Файл "${invalidFile.name}" превышает 30MB!`);
            }
        });
        return Upload.LIST_IGNORE;
    }

    return false;
};

const itemRenderCallback =
    (field?: string) =>
    (
        _originNode: React.ReactElement,
        file: UploadFile,
        _fileList: Array<UploadFile>,
        actions: {
            download: () => void;
            preview: () => void;
            remove: () => void;
        }
    ): React.ReactNode => {
        return (
            <Flex
                justify="space-between"
                align="center"
                gap="20px"
                style={{ width: "100%", marginTop: "10px" }}
            >
                {field && (
                    <Form.Item name={[field, file.uid]} style={{ flex: 1, margin: 0 }}>
                        <InputGeoposition fullWidth />
                    </Form.Item>
                )}
                <Flex align="center" gap="8px" style={{ flex: 2 }}>
                    <FileImageOutlined />
                    <Text>{file.name}</Text>
                </Flex>
                <Button type="text" style={{ marginLeft: "auto" }} onClick={actions.remove}>
                    <DeleteOutlined />
                </Button>
            </Flex>
        );
    };

export const uploaderProps = (field?: string): UploadProps => ({
    name: "file",
    multiple: true,
    accept: "image/*",
    beforeUpload,
    itemRender: itemRenderCallback(field),
});
