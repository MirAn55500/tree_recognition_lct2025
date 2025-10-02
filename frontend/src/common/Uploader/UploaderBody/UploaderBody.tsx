import { InboxOutlined } from "@ant-design/icons";

const UploaderBody = () => {
    return (
        <>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Выберите или перетащите фотографии в эту зону</p>
            <p className="ant-upload-hint">
                Поддерживает загрузку одной или нескольких фотографий.
            </p>
        </>
    );
};

export default UploaderBody;
