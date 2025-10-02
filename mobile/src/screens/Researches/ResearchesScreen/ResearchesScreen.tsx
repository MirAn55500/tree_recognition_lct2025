import React, { useLayoutEffect } from "react";
import { FlatList, TouchableOpacity, View, Image } from "react-native";
import { Button, Flex, Icon, Text } from "@ant-design/react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

import styles from "./ResearchesScreen.styles";
import {
    ResearchesScreenNavigationProp,
    ResearchesScreenRouteProp,
} from "./ResearchesScreen.types";

import { useGetResearchesQuery } from "services/api/research.api";
import { ResearchPreview } from "#types/research";
import getPhotoLink from "utils/getPhotoLink";

interface ResearchScreenProps {
    route: ResearchesScreenRouteProp;
}

const ResearchScreen: React.FC<ResearchScreenProps> = ({ route }) => {
    const navigation = useNavigation<ResearchesScreenNavigationProp>();
    const { data } = useGetResearchesQuery();

    const openCard = (id: number) => {
        navigation.navigate("Research", { id });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    type="primary"
                    size="small"
                    style={styles.addButton}
                    onPress={() => navigation.navigate("CreateResearch")}
                >
                    <AntDesign name="plus" color="#FFF" />
                </Button>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.researches}>
            {data && (
                <FlatList<ResearchPreview>
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
                    renderItem={(listItem) => (
                        <TouchableOpacity onPress={() => openCard(listItem.item.id)}>
                            <Flex style={styles.research}>
                                <Flex style={styles.researchImage}>
                                    {listItem.item.research_photos.length === 0 && (
                                        <Icon name="file-image" />
                                    )}
                                    {listItem.item.research_photos.length > 0 && (
                                        <Image
                                            source={{
                                                uri: getPhotoLink(
                                                    listItem.item.research_photos[0].photo_id
                                                ),
                                            }}
                                            style={styles.researchImage}
                                        />
                                    )}
                                </Flex>
                                <Flex style={styles.researchBody}>
                                    <Flex>
                                        <Text numberOfLines={1} style={styles.researchTitle}>
                                            {listItem.item.name}
                                        </Text>
                                    </Flex>
                                    <Flex style={styles.researchDescription}>
                                        {!listItem.item.description && (
                                            <Text
                                                numberOfLines={3}
                                                style={styles.researchNoDescription}
                                            >
                                                Нет описания
                                            </Text>
                                        )}
                                        {listItem.item.description && (
                                            <Text numberOfLines={3}>
                                                {listItem.item.description}
                                            </Text>
                                        )}
                                    </Flex>
                                    <Flex style={styles.researchCreated}>
                                        <Icon name="calendar" />
                                        <Text style={styles.researchCreatedText}>
                                            {new Date(
                                                listItem.item.created_at
                                            ).toLocaleDateString()}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default ResearchScreen;
