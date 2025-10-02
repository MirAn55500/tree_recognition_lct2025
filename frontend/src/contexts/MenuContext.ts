import { createContext } from "react";

export interface IMenuContext {
    collapsed: boolean;
    setCollapsed: (newValue: boolean) => void;
}

const defaultValues: IMenuContext = {
    collapsed: false,
    setCollapsed: () => {},
};

const MenuContext = createContext(defaultValues);

export default MenuContext;
