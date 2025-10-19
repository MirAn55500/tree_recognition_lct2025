import { Button, Divider, Flex, Typography } from "antd";
import { Link } from "react-router-dom";

import "./GalleryMain.css";

import { useGetPhotosFullQuery } from "@services/api/photo.api";

import Gallery from "@common/Gallery/Gallery";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

const GalleryPage = () => {
    const { data: photosData } = useGetPhotosFullQuery();

    return (
        <Flex className="page-container">
            <Flex className="gallery-page-toolbar">
                <Title level={3}>Галерея</Title>
                <Flex>
                    <Link to="create">
                        <Button type="primary">
                            Добавить <PlusOutlined />
                        </Button>
                    </Link>
                </Flex>
            </Flex>
            <Divider />
            <Gallery className="gallery-page-main-wrapper" photosData={photosData} />
        </Flex>
    );
};

export default GalleryPage;
