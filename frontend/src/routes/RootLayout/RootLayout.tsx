import { Flex, Layout, Menu } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import {
    CloudDownloadOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    ProductOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Outlet, Link as NavLink, useLocation } from "react-router-dom";

import "./RootLayout.css";

import { findMatchingPrefix } from "./utils";

const { Content, Sider } = Layout;

type RootLayoutKeys = "/map" | "/research" | "/gallery" | "/";

const availableKeys = ["/", "/map", "/research", "/gallery"];
const items: ItemType[] = [
    {
        key: availableKeys[0],
        label: <NavLink to={availableKeys[0]}>О приложении</NavLink>,
        icon: <HomeOutlined />,
    },
    {
        key: availableKeys[1],
        label: <NavLink to={availableKeys[1]}>Карта</NavLink>,
        icon: <EnvironmentOutlined />,
    },
    {
        key: availableKeys[2],
        label: <NavLink to={availableKeys[2]}>Исследования</NavLink>,
        icon: <SearchOutlined />,
    },
    {
        key: availableKeys[3],
        label: <NavLink to={availableKeys[3]}>Классификация</NavLink>,
        icon: <ProductOutlined />,
    },
];
const bottomItems: ItemType[] = [
    {
        key: "/download",
        label: "Мобильное приложение",
        icon: <CloudDownloadOutlined />,
        onClick: () => {},
    },
];

const RootLayout = () => {
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState<RootLayoutKeys>(
        availableKeys[0] as RootLayoutKeys
    );

    useEffect(() => {
        const foundedItem = findMatchingPrefix(availableKeys, location.pathname);

        if (foundedItem) {
            setSelectedKey(foundedItem as RootLayoutKeys);
        } else {
            setSelectedKey(availableKeys[0] as RootLayoutKeys);
        }
    }, [location.pathname]);

    return (
        <Layout hasSider>
            <Sider collapsed className="root-layout-sider">
                <Flex justify="center" className="root-layout-logo-container">
                    <img src="/logo.ico" width="40px" />
                </Flex>
                <Menu
                    className="root-layout-menu"
                    theme="dark"
                    mode="inline"
                    items={items}
                    selectedKeys={[selectedKey]}
                />
                <Menu theme="dark" mode="inline" items={bottomItems} selectable={false} />
            </Sider>
            <Content className="root-layout-content">
                <Outlet />
            </Content>
        </Layout>
    );
};

export default RootLayout;
