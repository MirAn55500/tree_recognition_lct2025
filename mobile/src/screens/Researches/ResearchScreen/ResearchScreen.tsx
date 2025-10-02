import { List, Text } from "@ant-design/react-native";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ResearchScreenNavigationProp, ResearchScreenRouteProp } from "./ResearchScren.types";

import ImageSlider from "#common/ImageSlider/ImageSlider";

import { useGetResearchQuery } from "services/api/research.api";

interface ResearchScreenProps {
    route: ResearchScreenRouteProp;
}

const ResearchScreen: React.FC<ResearchScreenProps> = ({ route }) => {
    const navigation = useNavigation<ResearchScreenNavigationProp>();
    const id = route.params.id;
    const { data: researchData } = useGetResearchQuery(id);

    return (
        <ScrollView>
            {!researchData && <Text>Данные пока отсутствуют...</Text>}
            {researchData && (
                <>
                    <List>
                        <List.Item>
                            <Text style={{ fontWeight: "bold" }}>Название исследования</Text>
                        </List.Item>
                        <List.Item>
                            <Text>{researchData.name}</Text>
                        </List.Item>
                    </List>
                    <List>
                        <List.Item>
                            <Text style={{ fontWeight: "bold" }}>Описание исследования</Text>
                        </List.Item>
                        <List.Item>
                            {researchData.description !== null && (
                                <Text>{researchData.description}</Text>
                            )}
                            {researchData.description === null && (
                                <Text disabled>Описание отсутствует</Text>
                            )}
                        </List.Item>
                    </List>
                    <List>
                        <List.Item>
                            <Text style={{ fontWeight: "bold" }}>Галерея</Text>
                        </List.Item>
                        <List.Item>
                            <ImageSlider values={researchData.photos} />
                        </List.Item>
                    </List>
                </>
            )}
        </ScrollView>
    );
};

export default ResearchScreen;
