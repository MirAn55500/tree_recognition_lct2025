import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "#navigation/Navigation";

export type CreateResearchScreenRouteProp = RouteProp<RootStackParamList, "CreateResearch">;
export type CreateResearchScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "CreateResearch"
>;
