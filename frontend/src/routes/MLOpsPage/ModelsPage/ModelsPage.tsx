import { Divider, Flex, Typography } from "antd";

import ModelCard from "./ModelCard/ModelCard";

import Grid from "@common/Grid/Grid";

const { Title } = Typography;

export interface Model {
    name: string;
    file: string;
    id: string;
}

const ModelsPage = () => {
    const models: Model[] = [
        {
            name: "best_characteristics_model_base.pth",
            file: "best_characteristics_model_base.pth",
            id: "best_characteristics_model_base.pth",
        },
        {
            name: "best_diseases_model_base.pth",
            file: "best_diseases_model_base.pth",
            id: "best_diseases_model_base.pth",
        },
        {
            name: "best_diseases_model_test.pth",
            file: "best_diseases_model_test.pth",
            id: "best_diseases_model_test.pth",
        },
        {
            name: "best_species_model_base.pth",
            file: "best_species_model_base.pth",
            id: "best_species_model_base.pth",
        },
        {
            name: "best_species_model_test.pth",
            file: "best_species_model_test.pth",
            id: "best_species_model_test.pth",
        },
    ];

    return (
        <>
            <Flex>
                <Title level={4}>Обученные модели</Title>
            </Flex>
            <Divider />

            <Grid<Model> data={models} render={(model) => <ModelCard model={model} />} />
        </>
    );
};

export default ModelsPage;
