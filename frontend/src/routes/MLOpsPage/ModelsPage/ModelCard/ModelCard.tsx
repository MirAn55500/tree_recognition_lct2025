import { Button, Card, Flex, Tooltip, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

import type { Model } from "../ModelsPage";

import "./ModelCard.css";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface ModelCardProps {
    model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model: { name, id } }) => {
    const navigate = useNavigate();

    const handleUseClick = () => {
        navigate(`/mlops/training/${id}`);
    };

    return (
        <Card
            title={
                <Tooltip title={name}>
                    <Text ellipsis>{name}</Text>
                </Tooltip>
            }
            className="model"
        >
            <Flex className="model-content">
                <Button type="primary" onClick={handleUseClick}>
                    <CheckCircleOutlined /> Использовать
                </Button>
                {/* <Button>
                    <DownloadOutlined /> Скачать
                </Button> */}
            </Flex>
        </Card>
    );
};

export default ModelCard;
