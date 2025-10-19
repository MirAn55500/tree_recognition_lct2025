import type { AverageStatistics } from "#types/research";

import EmptyLabel from "@common/EmptyLabel/EmptyLabel";
import AverageStatisticsCard from "@common/AverageStatistics/AverageStatistics";

interface PolygonStatisticsProps {
    areaName: string;
    statistics?: AverageStatistics;
}

const PolygonStatistics: React.FC<PolygonStatisticsProps> = ({ areaName, statistics }) => {
    return (
        <>
            {statistics && (
                <AverageStatisticsCard
                    statistics={statistics}
                    title={`Усредненная статистика по области "${areaName}"`}
                />
            )}
            {!statistics && <EmptyLabel placeholder="Усредненная статистика отсутствует" />}
        </>
    );
};

export default PolygonStatistics;
