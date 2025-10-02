import { Card, Tooltip, Typography } from "antd";
import { Link } from "react-router-dom";

import "./Research.css";

import type { ResearchItem } from "#types/research";

const { Text } = Typography;

interface ResearchItemProps {
    item: ResearchItem;
}

const Research: React.FC<ResearchItemProps> = ({ item }) => {
    const { id, name, created_at, description } = item;

    return (
        <Link to={String(id)}>
            <Card
                title={
                    <Tooltip title={name}>
                        <Text ellipsis>{name}</Text>
                    </Tooltip>
                }
                extra={<Text>{new Date(created_at).toLocaleDateString()}</Text>}
                className="research"
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

export default Research;
