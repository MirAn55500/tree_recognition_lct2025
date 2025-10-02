import { Button, Col, Flex, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import "./Gallery.css";

import ImageWithStatics from "@common/ImageWithStatics/ImageWithStatics";
import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

import { useGetPhotosFullQuery } from "@services/api/photo.api";
import getPhotoLink from "@utils/getPhotoLink";

const { Title } = Typography;

const GalleryPage = () => {
    const navigate = useNavigate();
    const { data: photosData } = useGetPhotosFullQuery();

    return (
        <Flex className="research-page-container">
            <Flex className="research-page-toolbar">
                <Title level={3}>Галерея</Title>
                <Flex>
                    <Button onClick={() => navigate("create")}>Добавить</Button>
                </Flex>
            </Flex>

            {photosData && (
                <Row gutter={[16, 16]} className="researches-container">
                    {photosData.map((photoItem) => (
                        <Col span={6}>
                            <ImageWithStatics src={getPhotoLink(photoItem.id)} item={photoItem} />
                        </Col>
                    ))}
                </Row>
            )}

            {!photosData && <EmptyLabel />}
        </Flex>
    );
};

export default GalleryPage;
