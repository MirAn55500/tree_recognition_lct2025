import { ArrowLeftOutlined, CalendarOutlined } from "@ant-design/icons";
import { Col, Flex, Input, Row, Skeleton, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import "./DatasetView.css";

import ImageWithStatics from "@common/ImageWithStatics/ImageWithStatics";
import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

import { useGetDatasetQuery } from "@services/api/dataset.api";

import getPhotoLink from "@utils/getPhotoLink";

const { Title, Link } = Typography;

const DatasetView = () => {
    const params = useParams();
    const navigate = useNavigate();

    const datasetId = params.datasetId;

    const { data: datasetData } = useGetDatasetQuery(Number(datasetId) || skipToken);

    const goBack = () => navigate("/mlops/datasets");

    return (
        <>
            <Flex className="dataset-view-header">
                <Link onClick={goBack}>
                    <ArrowLeftOutlined /> Назад
                </Link>

                {!datasetData && (
                    <Skeleton loading={!datasetData} paragraph={{ rows: 0 }}></Skeleton>
                )}
                {datasetData && (
                    <Flex className="dataset-view-titles">
                        <Title level={3} ellipsis>
                            {datasetData.name}
                        </Title>
                        <Title level={5}>
                            <CalendarOutlined />{" "}
                            {new Date(datasetData.created_at).toLocaleDateString()}
                        </Title>
                    </Flex>
                )}
            </Flex>

            <Flex className="dataset-description">
                <Title level={4}>Описание</Title>
                {!datasetData && <Skeleton.Node className="skeleton-full" />}
                {datasetData && (
                    <Input.TextArea
                        value={datasetData.description || "Описание отсутствует"}
                        disabled={!datasetData.description}
                        readOnly
                    />
                )}
            </Flex>

            <Flex className="dataset-gallery">
                <Title level={4}>Галерея</Title>

                {!datasetData && <Skeleton.Node className="skeleton-full" />}
                {datasetData && datasetData.photo_ids.length > 0 && (
                    <Row gutter={[16, 16]} className="researches-container">
                        {datasetData.photo_ids.map((id) => (
                            <Col span={6} key={id}>
                                <ImageWithStatics src={getPhotoLink(id)} item={id} />
                            </Col>
                        ))}
                    </Row>
                )}
                {datasetData && datasetData.photo_ids.length === 0 && <EmptyLabel />}
            </Flex>
        </>
    );
};

export default DatasetView;
