import { Button, Divider, Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

import "./ResearchList.css";

import { useGetResearchesQuery } from "@services/api/research.api";

import Grid from "@common/Grid/Grid";

import Research from "./Research/Research";
import type { ResearchItem } from "#types/research";

const { Title } = Typography;

const ResearchPage = () => {
    const { data: researchesData } = useGetResearchesQuery();

    return (
        <Flex className="page-container">
            <Flex className="research-page-toolbar">
                <Title level={3}>Выездные исследования</Title>
                <Flex>
                    <Link to="create">
                        <Button type="primary">
                            Добавить <PlusOutlined />
                        </Button>
                    </Link>
                </Flex>
            </Flex>
            <Divider />

            <Grid<ResearchItem>
                data={researchesData}
                key={"id"}
                render={(research) => <Research item={research} />}
                className="researches-container"
            />
        </Flex>
    );
};

export default ResearchPage;
