import { Card, Tooltip, Typography } from "antd";
import { Link } from "react-router-dom";

import "./DatasetCard.css";

import type { Dataset } from "#types/dataset";

const { Text } = Typography;

interface DatasetCardProps {
    item: Dataset;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ item }) => {
    const { id, name, created_at, description } = item;

    return (
        <Link to={`${id}`}>
            <Card
                title={
                    <Tooltip title={name}>
                        <Text ellipsis>{name}</Text>
                    </Tooltip>
                }
                extra={<Text>{new Date(created_at).toLocaleDateString()}</Text>}
                className="dataset"
            >
                {description && (
                    <Tooltip title={description}>
                        <Text ellipsis>{description}</Text>
                    </Tooltip>
                )}
                {!description && (
                    <Tooltip title={description}>
                        <Text ellipsis disabled>
                            Нет описания
                        </Text>
                    </Tooltip>
                )}
            </Card>
        </Link>
    );
};

export default DatasetCard;
