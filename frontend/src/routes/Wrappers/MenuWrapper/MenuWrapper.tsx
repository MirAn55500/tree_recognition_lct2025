import { useState, type FC } from "react";

import MenuContext from "@contexts/MenuContext";

import type { WrapperProps } from "../wrappers.type";

const MenuWrapper: FC<WrapperProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    return (
        <MenuContext.Provider value={{ collapsed, setCollapsed }}>{children}</MenuContext.Provider>
    );
};

export default MenuWrapper;
