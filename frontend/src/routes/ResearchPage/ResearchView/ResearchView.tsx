import { ArrowLeftOutlined, CalendarOutlined } from "@ant-design/icons";
import { Col, Flex, Input, Row, Skeleton, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import "./ResearchView.css";

import ImageWithStatics from "@common/ImageWithStatics/ImageWithStatics";
import EmptyLabel from "@common/EmptyLabel/EmptyLabel";
import AverageStatistics from "@common/AverageStatistics/AverageStatistics";

import { useGetResearchQuery } from "@services/api/research.api";

import getPhotoLink from "@utils/getPhotoLink";

const { Title, Link } = Typography;

const ResearchView = () => {
    const params = useParams();
    const navigate = useNavigate();

    const researchId = params.researchId;

    const { data: researchData } = useGetResearchQuery(Number(researchId) || skipToken);

    const goBack = () => navigate("/research");

    return (
        <Flex className="page-container">
            <Flex className="research-view-header">
                <Link onClick={goBack}>
                    <ArrowLeftOutlined /> Назад
                </Link>

                {!researchData && (
                    <Skeleton loading={!researchData} paragraph={{ rows: 0 }}></Skeleton>
                )}
                {researchData && (
                    <Flex className="research-view-titles">
                        <Title level={3} ellipsis>
                            {researchData.name}
                        </Title>
                        <Title level={5}>
                            <CalendarOutlined />{" "}
                            {new Date(researchData.created_at).toLocaleDateString()}
                        </Title>
                    </Flex>
                )}
            </Flex>

            {!researchData && <Skeleton.Node className="skeleton-full" />}
            {researchData &&
                researchData.average_statistics &&
                Object.keys(researchData.average_statistics).length !== 0 && (
                    <AverageStatistics statistics={researchData.average_statistics} />
                )}

            <Flex className="research-description">
                <Title level={4}>Описание</Title>
                {!researchData && <Skeleton.Node className="skeleton-full" />}
                {researchData && <Input.TextArea value={researchData.description} readOnly />}
            </Flex>

            <Flex className="research-gallery">
                <Title level={4}>Галерея</Title>

                {!researchData && <Skeleton.Node className="skeleton-full" />}
                {researchData && researchData.photos.length > 0 && (
                    <Row gutter={[16, 16]} className="researches-container">
                        {researchData.photos.map((photo) => (
                            <Col span={6} key={photo.id}>
                                <ImageWithStatics src={getPhotoLink(photo.id)} item={photo.id} />
                            </Col>
                        ))}
                    </Row>
                )}
                {researchData && researchData.photos.length === 0 && <EmptyLabel />}
            </Flex>
        </Flex>
    );
};

export default ResearchView;
