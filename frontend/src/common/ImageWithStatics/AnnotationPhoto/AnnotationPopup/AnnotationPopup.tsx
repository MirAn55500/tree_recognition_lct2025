import type { PopupProps } from "@annotorious/react";
import { Card, Descriptions, type DescriptionsProps, Tag, Progress } from "antd";
import type React from "react";

import "./AnnotationPopup.css";

import type { PhotoAnnotation } from "#types/photo";

const AnnotationPopup: React.FC<PopupProps> = ({ annotation }) => {
    const tagging = annotation.bodies.find((body) => body.purpose === "tagging");
    const response: PhotoAnnotation | undefined = tagging?.value
        ? JSON.parse(tagging.value)
        : undefined;

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

    const items: DescriptionsProps["items"] = response
        ? [
              {
                  key: "class",
                  label: "Класс",
                  children: (
                      <Tag
                          color={getPlantClassColor(response.class_name)}
                          className="annotation-popup-class-tag"
                      >
                          {getPlantClassLabel(response.class_name)}
                      </Tag>
                  ),
                  span: 3,
              },
              ...(response.species?.length && response.species_confidence?.length
                  ? [
                        {
                            key: "species",
                            label: "Вероятности видов",
                            children: (
                                <div className="annotation-popup-species-list">
                                    {response.species_confidence.map((_item, index) => (
                                        <div key={index} className="annotation-popup-species-item">
                                            <div className="annotation-popup-species-header">
                                                <span>{response.species[index]}</span>
                                            </div>
                                            <Progress
                                                percent={Math.round(
                                                    response.species_confidence[index] * 100
                                                )}
                                                size="small"
                                                className="annotation-popup-progress"
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
                      <div className="annotation-popup-defects-container">
                          {response.hollows > 0 && (
                              <Tag color="orange">Дупла: {response.hollows * 100}%</Tag>
                          )}
                          {response.cracks > 0 && (
                              <Tag color="volcano">Трещины: {response.cracks * 100}%</Tag>
                          )}
                          {response.stem_damage > 0 && (
                              <Tag color="red">Ствол: {response.stem_damage * 100}%</Tag>
                          )}
                          {response.crown_damage > 0 && (
                              <Tag color="purple">Крона: {response.crown_damage * 100}%</Tag>
                          )}
                          {response.fruiting_bodies > 0 && (
                              <Tag color="green">Плод. тела: {response.fruiting_bodies * 100}%</Tag>
                          )}
                          {response.dry_branches_percentage > 0 && (
                              <Tag color="magenta">
                                  Сухих ветвей: {response.dry_branches_percentage}%
                              </Tag>
                          )}
                      </div>
                  ),
                  span: 3,
              },
              ...(response.diseases?.length
                  ? [
                        {
                            key: "diseases",
                            label: "Заболевание",
                            children: (
                                <div className="annotation-popup-diseases-list">
                                    <Tag color="red" className="annotation-popup-disease-tag">
                                        {response.diseases[0]}
                                    </Tag>
                                    {/* {response.diseases.map((item, index) => (
                                        <div key={index} className="annotation-popup-disease-item">
                                            <div className="annotation-popup-disease-header">
                                                <Tag
                                                    color="red"
                                                    className="annotation-popup-disease-tag"
                                                >
                                                    {item}
                                                </Tag>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            ),
                            span: 3,
                        },
                    ]
                  : []),
          ]
        : [];

    return (
        <Card size="small" className="annotation-popup">
            <div className="annotation-popup-content">
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

export default AnnotationPopup;
