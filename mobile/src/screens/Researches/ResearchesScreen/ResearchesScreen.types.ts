import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "#navigation/Navigation";

export type ResearchesScreenRouteProp = RouteProp<RootStackParamList, "Researches">;
export type ResearchesScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Researches"
>;
