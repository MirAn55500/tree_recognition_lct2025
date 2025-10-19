import React, { useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@ant-design/react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export type LocationPickerType = { latitude: number; longitude: number } | undefined;

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onLocationSelect: (location: LocationPickerType) => void;
    initialLocation?: { latitude: number; longitude: number };
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    visible,
    onClose,
    onLocationSelect,
    initialLocation = { latitude: 55.7558, longitude: 37.6173 }, // Москва по умолчанию
}) => {
    const [selectedLocation, setSelectedLocation] = useState<LocationPickerType>(initialLocation);
    const [region, setRegion] = useState<Region>({
        ...initialLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setSelectedLocation(coordinate);
    };

    const handleConfirm = () => {
        onLocationSelect(selectedLocation);
        onClose();
    };

    const handleReset = () => {
        setSelectedLocation(undefined);
    };

    const handleRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Отмена</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Выберите местоположение</Text>
                        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Готово</Text>
                        </TouchableOpacity>
                    </View>

                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        region={region}
                        onPress={handleMapPress}
                        onRegionChangeComplete={handleRegionChangeComplete}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={selectedLocation}
                                draggable
                                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                            />
                        )}
                    </MapView>

                    <View style={styles.instructions}>
                        <TouchableOpacity onPress={handleReset}>
                            <Text
                                style={{
                                    ...styles.confirmButtonText,
                                    ...styles.centeredButton,
                                }}
                            >
                                Сбросить
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.instructionsText}>
                            Нажмите на карту для выбора местоположения
                        </Text>
                        <Text style={styles.coordinatesText}>
                            {selectedLocation
                                ? `Широта: ${selectedLocation.latitude.toFixed(
                                      6
                                  )}, Долгота: ${selectedLocation.longitude.toFixed(6)}`
                                : "Местоположение не выбрано"}
                        </Text>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    cancelButton: {
        padding: 8,
    },
    cancelButtonText: {
        color: "#ff4d4f",
        fontSize: 16,
    },
    confirmButton: {
        padding: 8,
    },
    confirmButtonText: {
        color: "#1890ff",
        fontSize: 16,
        fontWeight: "bold",
    },
    centeredButton: {
        textAlign: "center",
    },
    map: {
        flex: 1,
    },
    instructions: {
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    instructionsText: {
        textAlign: "center",
        marginBottom: 8,
        fontSize: 14,
    },
    coordinatesText: {
        textAlign: "center",
        fontSize: 12,
        color: "#666",
        fontFamily: "monospace",
    },
});

export default LocationPickerModal;
