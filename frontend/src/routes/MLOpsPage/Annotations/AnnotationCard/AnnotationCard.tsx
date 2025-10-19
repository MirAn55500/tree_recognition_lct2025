import { Card, Tag, message } from "antd";

import { useLocation, useNavigate } from "react-router-dom";

import "./AnnotationCard.css";

import { getStatusConfig } from "./props";

import getPhotoLink from "@utils/getPhotoLink";

import { useGetPhotoStatusQuery } from "@services/api/photo.api";

interface AnnotationCardProps {
    id: number;
    datasetId: number;
}

const AnnotationCard: React.FC<AnnotationCardProps> = ({ id, datasetId }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetPhotoStatusQuery(id);

    const statusConfig = getStatusConfig(isLoading, isError, data);

    const goTo = () => {
        if (!data || !["processed", "annotated"].includes(data.status)) {
            message.error("Фото не обработано моделью, редактирование недоступно");
            return;
        }

        if (pathname.split("/").length > 3) {
            return navigate(`${id}`);
        }

        return navigate(`${datasetId}/${id}`);
    };

    return (
        <Card
            onClick={goTo}
            className="annotation-card"
            cover={
                <div className="annotation-card-image-container">
                    <img
                        src={getPhotoLink(id)}
                        alt="Annotation"
                        className="annotation-card-image"
                    />
                </div>
            }
        >
            <div className="annotation-card-status">
                <Tag icon={statusConfig.icon} color={statusConfig.color} className="status-tag">
                    {statusConfig.text}
                </Tag>
            </div>
        </Card>
    );
};

export default AnnotationCard;
