import { StyleSheet } from "react-native";

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    imageContainer: {
        height: "70%",
    },
    annotationsContainer: {
        height: "30%",
        backgroundColor: "#f8f8f8",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingVertical: 10,
    },
    annotationsScrollContent: {
        paddingHorizontal: 10,
        alignItems: "center",
    },
    annotationCard: {
        width: 300,
        marginHorizontal: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    noAnnotations: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noAnnotationsText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    container: {
        backgroundColor: "#ffffffff",
        display: "flex",
    },
    imageWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
