import {
    ShapeType,
    useAnnotator,
    type AnnotoriousOpenSeadragonAnnotator,
} from "@annotorious/react";
import { InputNumber, Divider, Row, Col, Space, type FormInstance, Select } from "antd";
import { Form } from "antd";
import { classNamesOptions, diasesOptions, speciesOptions } from "../../props";

interface AnnotationSettingsProps {
    name: number;
    form: FormInstance;
}

const AnnotationSettings: React.FC<AnnotationSettingsProps> = ({ name, form }) => {
    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

    const updateAnnotation = () => {
        if (!annotator) return;

        const annotations = form.getFieldValue("annotations");
        const currentAnnotation = annotations?.[name];

        if (!currentAnnotation?.id) return;

        const { coordinates } = currentAnnotation;
        const width = coordinates["2"].x - coordinates["1"].x;
        const height = coordinates["2"].y - coordinates["1"].y;

        annotator.updateAnnotation({
            id: currentAnnotation.id,
            target: {
                annotation: currentAnnotation.id,
                selector: {
                    type: ShapeType.RECTANGLE,
                    geometry: {
                        x: coordinates["1"].x,
                        y: coordinates["1"].y,
                        w: width,
                        h: height,
                        bounds: {
                            minX: coordinates["1"].x,
                            minY: coordinates["1"].y,
                            maxX: coordinates["2"].x,
                            maxY: coordinates["2"].y,
                        },
                    } as unknown as any,
                },
            },
        });
    };

    const normalizeToZero = (value: any) => (value == null ? 0 : value);

    return (
        <div>
            <Divider orientation="left">Координаты блока</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Левый верхний угол">
                        <Space.Compact>
                            <Form.Item
                                name={[name, "coordinates", "1", "x"]}
                                noStyle
                                getValueFromEvent={(value) => {
                                    const v = normalizeToZero(value);
                                    setTimeout(() => updateAnnotation(), 0);
                                    return v;
                                }}
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber placeholder="X" style={{ width: "50%" }} />
                            </Form.Item>
                            <Form.Item
                                name={[name, "coordinates", "1", "y"]}
                                noStyle
                                getValueFromEvent={(value) => {
                                    const v = normalizeToZero(value);
                                    setTimeout(() => updateAnnotation(), 0);
                                    return v;
                                }}
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Y" style={{ width: "50%" }} />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Правый нижний угол">
                        <Space.Compact>
                            <Form.Item
                                name={[name, "coordinates", "2", "x"]}
                                noStyle
                                getValueFromEvent={(value) => {
                                    const v = normalizeToZero(value);
                                    setTimeout(() => updateAnnotation(), 0);
                                    return v;
                                }}
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber placeholder="X" style={{ width: "50%" }} />
                            </Form.Item>
                            <Form.Item
                                name={[name, "coordinates", "2", "y"]}
                                noStyle
                                getValueFromEvent={(value) => {
                                    const v = normalizeToZero(value);
                                    setTimeout(() => updateAnnotation(), 0);
                                    return v;
                                }}
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Y" style={{ width: "50%" }} />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Класс объекта</Divider>
            <Form.Item name={[name, "className"]}>
                <Select placeholder="Выберите вид" options={classNamesOptions}></Select>
            </Form.Item>

            <Divider orientation="left">Вид</Divider>
            <Form.Item name={[name, "species"]}>
                <Select placeholder="Выберите вид" options={speciesOptions}></Select>
            </Form.Item>

            <Divider orientation="left">Болезнь</Divider>
            <Form.Item name={[name, "diseases"]}>
                <Select placeholder="Выберите вид" options={diasesOptions}></Select>
            </Form.Item>

            <Divider orientation="left">Характеристики (%)</Divider>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Дупла" name={[name, "hollows"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Трещины" name={[name, "cracks"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            step={1}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Повреждение ствола" name={[name, "stemDamage"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            step={1}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Повреждения кроны" name={[name, "crownDamage"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            step={1}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Плодовые тела" name={[name, "fruitingBodies"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            step={1}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Сухие ветки" name={[name, "dryBranches"]}>
                        <InputNumber
                            placeholder="Введите число"
                            min={0}
                            max={100}
                            step={1}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default AnnotationSettings;
