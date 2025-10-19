import { Tabs, type TabsProps } from "antd";
import { useMemo } from "react";

import "./PolygonPreview.css";

import PolygonGallery from "./PolygonGallery/PolygonGallery";
import PolygonStatistics from "./PolygonStatistics/PolygonStatistics";

import { useGetAreaStatsQuery } from "@services/api/map.api";

interface PolygonPreviewProps {
    areaId: number;
    areaName: string;
}

const PolygonPreview: React.FC<PolygonPreviewProps> = ({ areaId, areaName }) => {
    const { data } = useGetAreaStatsQuery(areaId);

    const items: TabsProps["items"] = useMemo(
        () => [
            {
                key: "statistics",
                label: "Статистика",
                children: (
                    <PolygonStatistics statistics={data?.average_statistics} areaName={areaName} />
                ),
            },
            {
                key: "gallery",
                label: "Галерея",
                children: <PolygonGallery photoIds={data?.photo_ids} />,
            },
        ],
        [data]
    );

    return <Tabs defaultActiveKey="statistics" items={items} className="polygon-preview-tabs" />;
};

export default PolygonPreview;
