import { View, Text } from "react-native";

import styles from "./EmptySlider.style";

const EmptySlider = () => {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет фотографий</Text>
        </View>
    );
};

export default EmptySlider;
