import { Card, Descriptions, type DescriptionsProps, Tag, Progress, Tooltip } from "antd";
import type React from "react";

import "./StatisticsCard.css";

import type { PhotoAnnotation } from "#types/photo";

interface StatisticsCardProps {
    data?: PhotoAnnotation;
    index?: number;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ data, index }) => {
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

    const roundToTwo = (num: number): number => {
        return Math.round(num * 100) / 100;
    };

    const items: DescriptionsProps["items"] = data
        ? [
              {
                  key: "class",
                  label: "Класс",
                  children: (
                      <Tooltip title={getPlantClassLabel(data.class_name)}>
                          <Tag
                              color={getPlantClassColor(data.class_name)}
                              className="statistics-card-class-tag"
                          >
                              <span className="statistics-card-ellipsis">
                                  {getPlantClassLabel(data.class_name)}
                              </span>
                          </Tag>
                      </Tooltip>
                  ),
                  span: 3,
              },
              ...(data.species?.length && data.species_confidence?.length
                  ? [
                        {
                            key: "species",
                            label: "Вероятности видов",
                            children: (
                                <div className="statistics-card-species-list">
                                    {data.species_confidence.map((_item, index) => (
                                        <div key={index} className="statistics-card-species-item">
                                            <div className="statistics-card-species-header">
                                                <Tooltip title={data.species[index]}>
                                                    <span className="statistics-card-ellipsis">
                                                        {data.species[index]}
                                                    </span>
                                                </Tooltip>
                                            </div>
                                            <Progress
                                                percent={Math.round(
                                                    data.species_confidence[index] * 100
                                                )}
                                                size="small"
                                                className="statistics-card-progress"
                                                strokeColor={{
                                                    "0%": "#108ee9",
                                                    "100%": "#87d068",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ),
                            span: 3,
                        },
                    ]
                  : []),
              {
                  key: "defects",
                  label: "Дефекты",
                  children: (
                      <div className="statistics-card-defects-container">
                          {data.hollows > 0 && (
                              <Tag color="orange">Дупла: {roundToTwo(data.hollows * 100)}%</Tag>
                          )}
                          {data.cracks > 0 && (
                              <Tag color="volcano">Трещины: {roundToTwo(data.cracks * 100)}%</Tag>
                          )}
                          {data.stem_damage > 0 && (
                              <Tag color="red">Ствол: {roundToTwo(data.stem_damage * 100)}%</Tag>
                          )}
                          {data.crown_damage > 0 && (
                              <Tag color="purple">
                                  Крона: {roundToTwo(data.crown_damage * 100)}%
                              </Tag>
                          )}
                          {data.fruiting_bodies > 0 && (
                              <Tag color="green">
                                  Плод. тела: {roundToTwo(data.fruiting_bodies * 100)}%
                              </Tag>
                          )}
                          {data.dry_branches_percentage > 0 && (
                              <Tag color="magenta">
                                  Сухих ветвей: {roundToTwo(data.dry_branches_percentage)}%
                              </Tag>
                          )}
                      </div>
                  ),
                  span: 3,
              },
              ...(data.diseases?.length
                  ? [
                        {
                            key: "diseases",
                            label: "Заболевание",
                            children: (
                                <Tooltip title={data.diseases[0]}>
                                    <Tag
                                        color={data.diseases[0] === "Здоров" ? "green" : "red"}
                                        className="statistics-card-disease-tag"
                                    >
                                        <span className="statistics-card-ellipsis">
                                            {data.diseases[0]}
                                        </span>
                                    </Tag>
                                </Tooltip>
                            ),
                            span: 3,
                        },
                    ]
                  : []),
          ]
        : [];

    return (
        <Card size="small" className="statistics-card">
            {typeof index === "number" && <div className="statistics-card-index">{index}</div>}
            <div
                className={`statistics-card-content ${
                    typeof index === "number" ? "with-index" : ""
                }`}
            >
                <Descriptions
                    bordered
                    items={items}
                    size="small"
                    column={1}
                    labelStyle={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        width: "30%",
                        backgroundColor: "#fafafa",
                    }}
                    contentStyle={{ fontSize: "12px" }}
                />
            </div>
        </Card>
    );
};

export default StatisticsCard;
