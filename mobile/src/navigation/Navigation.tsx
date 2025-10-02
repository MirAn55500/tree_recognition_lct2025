import { createStaticNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign } from "@expo/vector-icons";

import ResearchesScreen from "#screens/Researches/ResearchesScreen/ResearchesScreen";
import GalleryScreen from "#screens/GalleryScreen/GalleryScreen";
import SettingsScreen from "#screens/SettingsScreen/SettingsScreen";
import CreateResearchScreen from "#screens/Researches/CreateResearchScreen/CreateResearchScreen";
import ResearchScreen from "#screens/Researches/ResearchScreen/ResearchScreen";

const RootTabs = createBottomTabNavigator({
    screens: {
        Settings: {
            screen: SettingsScreen,
            options: {
                title: "Настройки",
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="setting" size={size} color={color} />
                ),
            },
        },
        Researches: {
            screen: ResearchesScreen,
            options: {
                title: "Исследования",
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="search" size={size} color={color} />
                ),
            },
        },
        Gallery: {
            screen: GalleryScreen,
            options: {
                title: "Галерея",
                tabBarIcon: ({ color, size }) => (
                    <AntDesign name="appstore" size={size} color={color} />
                ),
            },
        },
    },
});

const RootStack = createNativeStackNavigator({
    initialRouteName: "Root",
    screens: {
        Root: {
            screen: RootTabs,
            options: {
                headerShown: false,
            },
        },
        CreateResearch: {
            screen: CreateResearchScreen,
            options: {
                title: "Провести исследование",
            },
        },
        Research: {
            screen: ResearchScreen,
            options: {
                title: "Исследование",
            },
        },
    },
});

export type RootStackParamList = {
    Root: undefined;

    Researches: undefined;
    CreateResearch: undefined;
    Research: {
        id: number;
    };

    Gallery: undefined;
};

const Navigation = createStaticNavigation(RootStack);

export default Navigation;
