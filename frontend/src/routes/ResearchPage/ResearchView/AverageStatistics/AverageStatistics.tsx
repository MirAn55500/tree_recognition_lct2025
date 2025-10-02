import React from "react";
import { Card, Descriptions, Tag, Progress, Row, Col } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

import type { AverageStatistics } from "#types/research";

interface AverageStatisticsProps {
    statistics: AverageStatistics;
    title?: string;
}

const AverageStatisticsCard: React.FC<AverageStatisticsProps> = ({
    statistics,
    title = "Усредненная статистика по исследованию",
}) => {
    const getPlantClassLabel = (class_name: string) => {
        const classMap: Record<string, string> = {
            "a tree": "Дерево",
            tree: "Дерево",
            "a shrub": "Кустарник",
            shrub: "Кустарник",
            "a tree a shrub": "Дерево-кустарник",
            "tree a shrub": "Дерево-кустарник",
            "a tree shrub": "Дерево-кустарник",
            "tree shrub": "Дерево-кустарник",
        };
        return classMap[class_name] || class_name;
    };

    const getPlantClassColor = (class_name: string) => {
        const colorMap: Record<string, string> = {
            "a tree": "green",
            tree: "green",
            "a shrub": "blue",
            shrub: "blue",
            "a tree a shrub": "orange",
            "a tree shrub": "orange",
            "tree a shrub": "orange",
            "tree shrub": "orange",
        };
        return colorMap[class_name] || "default";
    };

    const items = [
        {
            key: "class",
            label: "Преобладающий класс",
            children: (
                <Tag color={getPlantClassColor(statistics.class_name)} style={{ fontSize: "12px" }}>
                    {getPlantClassLabel(statistics.class_name)}
                </Tag>
            ),
        },
        ...(statistics.species_probabilities
            ? [
                  {
                      key: "species",
                      label: "Вероятность видов",
                      children: (
                          <Tag color="blue" style={{ fontSize: "12px" }}>
                              {statistics.species_probabilities}
                          </Tag>
                      ),
                  },
              ]
            : []),
        {
            key: "defects",
            label: "Параметры повреждений",
            children: (
                <Row gutter={[4, 4]} style={{ marginTop: 4 }}>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Дупла:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.hollows * 100)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="orange"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.hollows * 100)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Трещины:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.cracks * 100)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="volcano"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.cracks * 100)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Повреждения ствола:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.stem_damage * 100)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="red"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.stem_damage * 100)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Повреждения кроны:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.crown_damage * 100)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="purple"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.crown_damage * 100)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Сухие ветви:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.dry_branches_percentage)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="magenta"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.dry_branches_percentage)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "11px",
                            }}
                        >
                            <span>Плодовые тела:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress
                                    percent={Math.round(statistics.fruiting_bodies * 100)}
                                    size="small"
                                    style={{ margin: 0, width: 60 }}
                                    showInfo={false}
                                />
                                <Tag
                                    color="green"
                                    style={{
                                        margin: 0,
                                        fontSize: "10px",
                                        minWidth: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Math.round(statistics.fruiting_bodies * 100)}%
                                </Tag>
                            </div>
                        </div>
                    </Col>
                </Row>
            ),
        },
        ...(statistics.diseases
            ? [
                  {
                      key: "diseases",
                      label: "Основные заболевания",
                      children: (
                          <Tag color="red" style={{ fontSize: "12px" }}>
                              {statistics.diseases}
                          </Tag>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <Card
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChartOutlined />
                    {title}
                </div>
            }
            size="small"
            style={{ width: "100%" }}
        >
            <Descriptions
                bordered
                items={items}
                size="small"
                column={1}
                labelStyle={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    width: "40%",
                    backgroundColor: "#fafafa",
                }}
                contentStyle={{ fontSize: "12px" }}
            />
        </Card>
    );
};

export default AverageStatisticsCard;
