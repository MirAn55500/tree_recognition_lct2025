import {
    BarChartOutlined,
    FolderOpenOutlined,
    FormOutlined,
    RocketOutlined,
} from "@ant-design/icons";
import { Flex, Tabs, Typography, type TabsProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Title } = Typography;

const items: TabsProps["items"] = [
    {
        key: "datasets",
        icon: <FolderOpenOutlined />,
        label: "Датасеты",
    },
    {
        key: "annotations",
        icon: <FormOutlined />,
        label: "Аннотации",
    },
    {
        key: "training",
        icon: <RocketOutlined />,
        label: "Обучение",
    },
    {
        key: "models",
        icon: <BarChartOutlined />,
        label: "Модели",
    },
];

const MLOpsLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeTab = location.pathname.split("/")[2] || "datasets";

    const handleTabChange = (key: string) => {
        navigate(`${key}`);
    };

    return (
        <Flex className="page-container">
            <Title level={3}>Дообучение моделей для анализа деревьев</Title>
            <Tabs activeKey={activeTab} items={items} onChange={handleTabChange}></Tabs>
            <Outlet />
        </Flex>
    );
};

export default MLOpsLayout;
