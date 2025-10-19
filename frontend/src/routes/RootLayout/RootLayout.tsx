import { Flex, Layout, Menu } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import {
    CloudDownloadOutlined,
    CloudServerOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    ProductOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { Outlet, Link as NavLink, useLocation } from "react-router-dom";

import "./RootLayout.css";

import { findMatchingPrefix } from "./utils";

const { Content, Sider } = Layout;

type RootLayoutKeys = "/map" | "/research" | "/gallery" | "/" | "/mlops";

const availableKeys = ["/", "/map", "/research", "/gallery", "/mlops"];

const RootLayout = () => {
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState<RootLayoutKeys>(
        availableKeys[0] as RootLayoutKeys
    );
    const linkRef = useRef<HTMLAnchorElement>(null);

    const handleDownload = () => {
        if (linkRef.current) {
            linkRef.current.click();
        }
    };

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
            label: <NavLink to={availableKeys[3]}>Галерея</NavLink>,
            icon: <ProductOutlined />,
        },
        {
            key: availableKeys[4],
            label: <NavLink to={availableKeys[4]}>ML студия</NavLink>,
            icon: <CloudServerOutlined />,
        },
    ];

    const bottomItems: ItemType[] = [
        {
            key: "/download",
            label: "Мобильное приложение",
            icon: <CloudDownloadOutlined />,
            onClick: handleDownload,
        },
    ];

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

                <a ref={linkRef} href="/app.apk" download="app.apk" style={{ display: "none" }} />
            </Sider>
            <Content className="root-layout-content">
                <Outlet />
            </Content>
        </Layout>
    );
};

export default RootLayout;
