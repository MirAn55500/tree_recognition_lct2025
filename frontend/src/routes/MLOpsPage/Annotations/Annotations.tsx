import { Divider, Empty, Flex, Select, Typography } from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import "./Annotations.css";

import { useGetDatasetQuery, useGetDatasetsQuery } from "@services/api/dataset.api";

import Grid from "@common/Grid/Grid";

import AnnotationCard from "./AnnotationCard/AnnotationCard";
import { SelectOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Annotations = () => {
    const { datasetId } = useParams<{ datasetId?: string }>();
    const navigate = useNavigate();
    const [selectedDataset, setSelectedDataset] = useState<number | undefined>(
        datasetId ? Number(datasetId) : undefined
    );

    const { data: datasets } = useGetDatasetsQuery();
    const { data: dataset } = useGetDatasetQuery(selectedDataset ?? skipToken, {
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (selectedDataset) {
            navigate(`/mlops/annotations/${selectedDataset}`, { replace: true });
        } else {
            navigate("/mlops/annotations", { replace: true });
        }
    }, [selectedDataset, navigate]);

    const handleChangeDataset = (id: number) => {
        setSelectedDataset(id);
    };

    const handleClear = () => {
        setSelectedDataset(undefined);
    };

    return (
        <Flex className="annotations-list">
            <Flex className="annotations-toolbar">
                <Title level={4}>Редактор аннотаций</Title>
                <Select
                    options={datasets?.map((dataset) => ({
                        value: dataset.id,
                        label: dataset.name,
                    }))}
                    placeholder="Выберите датасет"
                    onChange={handleChangeDataset}
                    onClear={handleClear}
                    allowClear
                    value={selectedDataset}
                />
            </Flex>
            <Divider />
            {selectedDataset && (
                <Grid<number>
                    data={dataset?.photo_ids}
                    render={(photoId) => (
                        <AnnotationCard id={photoId} datasetId={selectedDataset} />
                    )}
                />
            )}
            {!selectedDataset && (
                <Empty
                    image={<SelectOutlined className="empty-dataset-icon" />}
                    description={
                        <div className="empty-dataset-description">
                            <Text className="empty-dataset-title">Датасет не выбран</Text>
                            <Text className="empty-dataset-subtitle">
                                Выберите датасет из списка чтобы продолжить
                            </Text>
                        </div>
                    }
                    className="empty-dataset-container"
                />
            )}
        </Flex>
    );
};

export default Annotations;
