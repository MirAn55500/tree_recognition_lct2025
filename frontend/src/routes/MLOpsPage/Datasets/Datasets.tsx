import { Button, Divider, Flex, Typography } from "antd";

import "./Datasets.css";

import type { Dataset } from "#types/dataset";

import Grid from "@common/Grid/Grid";

import { useGetDatasetsQuery } from "@services/api/dataset.api";

import DatasetCard from "./DatasetCard/DatasetCard";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title } = Typography;

const Datasets = () => {
    const { data } = useGetDatasetsQuery();

    return (
        <Flex className="datasets-list">
            <Flex className="datasets-toolbar">
                <Title level={4}>Список датасетов</Title>
                <Link to="create">
                    <Button type="primary">
                        Добавить <PlusOutlined />
                    </Button>
                </Link>
            </Flex>
            <Divider />
            <Grid<Dataset> data={data} render={(dataset) => <DatasetCard item={dataset} />} />
        </Flex>
    );
};

export default Datasets;
