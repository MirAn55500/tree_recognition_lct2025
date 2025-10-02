import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "#navigation/Navigation";

export type ResearchScreenRouteProp = RouteProp<RootStackParamList, "Research">;
export type ResearchScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Research"
>;
