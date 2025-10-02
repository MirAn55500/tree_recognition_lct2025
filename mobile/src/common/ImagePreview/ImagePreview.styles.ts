import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    imageCard: {
        marginRight: 12,
    },
    imageWrapper: {
        position: "relative",
    },
    horizontalImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    locationButton: {
        position: "absolute",
        top: 4,
        left: 4,
        backgroundColor: "white",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.9,
    },
    locationButtonText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    removeButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "white",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.9,
    },
    removeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "red",
    },
});

export default styles;
