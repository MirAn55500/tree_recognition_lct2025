import { Flex, Image } from "antd";

import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

import "./PointPreview.css";

import getPhotoWithBoxesLink from "@utils/getPhotoWithBoxesLink";

import StatisticsCard from "@common/StatisticsCard/StatisticsCard";

import type { PhotoStatistics } from "#types/photo";

interface PointPreviewProps {
    id: number;
    statistics?: PhotoStatistics;
}

const PointPreview: React.FC<PointPreviewProps> = ({ id, statistics }) => {
    return (
        <Flex className="point-preview">
            <Image
                src={getPhotoWithBoxesLink(id)}
                wrapperClassName="point-preview-photo-wrapper"
                className="point-preview-photo"
            />
            <div className="point-preview-statistics">
                {statistics ? (
                    statistics.results.map((annotation, index) => (
                        <StatisticsCard key={index} data={annotation} index={index + 1} />
                    ))
                ) : (
                    <EmptyLabel placeholder="Аннотации отсутствуют" />
                )}
            </div>
        </Flex>
    );
};

export default PointPreview;
