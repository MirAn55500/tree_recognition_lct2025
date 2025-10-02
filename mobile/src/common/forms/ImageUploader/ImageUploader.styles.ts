import { StyleSheet } from "react-native";

export default StyleSheet.create({
    gridContainer: {
        marginTop: 16,
    },
    countText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        textAlign: "center",
    },
    horizontalContainer: {
        flexDirection: "row",
        paddingHorizontal: 8,
    },
    imageCard: {
        marginHorizontal: 6,
        padding: 4,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
    },
    imageWrapper: {
        position: "relative",
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: "hidden",
    },
    horizontalImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    removeButton: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#ff4d4f",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    removeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 18,
        textAlign: "center",
        includeFontPadding: false,
    },
});
