import { Button, Col, Divider, Flex, Row, Typography } from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

import "./ResearchList.css";

import { useGetResearchesQuery } from "@services/api/research.api";

import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

import Research from "./Research/Research";

const { Title } = Typography;

const ResearchPage = () => {
    const { data: researchesData } = useGetResearchesQuery();

    return (
        <Flex className="research-page-container">
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

            {researchesData && (
                <Row gutter={[16, 16]} className="researches-container">
                    {researchesData.map((research) => (
                        <Col span={8} key={research.id}>
                            <Research item={research} />
                        </Col>
                    ))}
                </Row>
            )}
            {!researchesData && <EmptyLabel />}
        </Flex>
    );
};

export default ResearchPage;
