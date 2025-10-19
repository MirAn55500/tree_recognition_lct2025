import {
    Divider,
    Flex,
    Form,
    Typography,
    Select,
    InputNumber,
    Button,
    message,
    type SelectProps,
} from "antd";
import { useParams } from "react-router-dom";

import "./TrainingPage.css";
import { useGetDatasetsQuery, useTrainDatasetMutation } from "@services/api/dataset.api";

const { Title } = Typography;

interface TrainingFormData {
    datasetId: number;
    modelId: string;
    ages: number;
    batchSize: number;
    learningRate: number;
    validationShare: number;
}

const Training = () => {
    const { modelId } = useParams<{ modelId?: string }>();
    const [form] = Form.useForm<TrainingFormData>();

    const { data: datasets } = useGetDatasetsQuery();
    const [trainDataset] = useTrainDatasetMutation();

    const datasetsOptions: SelectProps["options"] = (datasets ?? []).map((dataset) => ({
        label: dataset.name,
        value: dataset.id,
    }));

    const modelOptions: SelectProps["options"] = [
        {
            label: "best_characteristics_model_base.pth",
            value: "best_characteristics_model_base.pth",
        },
        { label: "best_diseases_model_base.pth", value: "best_diseases_model_base.pth" },
        { label: "best_diseases_model_test.pth", value: "best_diseases_model_test.pth" },
        { label: "best_species_model_base.pth", value: "best_species_model_base.pth" },
        { label: "best_species_model_test.pth", value: "best_species_model_test.pth" },
    ];

    const onFinish = async (values: TrainingFormData) => {
        const { error } = await trainDataset(values.datasetId);

        if (!error) {
            message.success("Обучение запущено!");
        }
    };

    return (
        <>
            <Flex className="training-toolbar">
                <Title level={4}>Обучение моделей</Title>
            </Flex>
            <Divider />
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    modelId,
                    ages: 50,
                    batchSize: 32,
                    learningRate: 0.0001,
                    validationShare: 0.2,
                }}
            >
                <Form.Item
                    name="datasetId"
                    label="Выберите датасет"
                    rules={[{ required: true, message: "Выберите датасет" }]}
                >
                    <Select placeholder="Выберите датасет" options={datasetsOptions} />
                </Form.Item>

                <Form.Item
                    name="modelId"
                    label="Выберите модель"
                    rules={[{ required: true, message: "Выберите модель" }]}
                >
                    <Select placeholder="Выберите модель" options={modelOptions} />
                </Form.Item>

                <Form.Item
                    name="ages"
                    label="Эпохи"
                    rules={[{ required: true, type: "number", min: 1 }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="batchSize"
                    label="Batch size"
                    rules={[{ required: true, type: "number", min: 1 }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="learningRate"
                    label="Learning rate"
                    rules={[{ required: true, type: "number", min: 0 }]}
                >
                    <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="validationShare"
                    label="Доля валидации"
                    rules={[{ required: true, type: "number", min: 0, max: 1 }]}
                >
                    <InputNumber min={0} max={1} step={0.01} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Запустить обучение
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default Training;
