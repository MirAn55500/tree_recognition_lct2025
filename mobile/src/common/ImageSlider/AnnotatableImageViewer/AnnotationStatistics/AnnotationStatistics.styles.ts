import { Dimensions, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "white",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    closeIcon: {
        fontSize: 20,
        color: "#666",
        fontWeight: "300",
        lineHeight: 20,
    },
    contentContainer: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    classTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    classText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
    },
    speciesItem: {
        gap: 4,
    },
    speciesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    percentage: {
        fontSize: 12,
        color: "#666",
    },
    progressBar: {
        height: 6,
        backgroundColor: "#f0f0f0",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#87d068",
    },
    defectsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    defectTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defectText: {
        color: "white",
        fontSize: 10,
        fontWeight: "500",
    },
    diseasesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    diseaseTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    diseaseText: {
        color: "white",
        fontSize: 10,
        fontWeight: "500",
    },

    compactContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    compactHeader: {
        marginBottom: 8,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    compactClassTag: {
        display: "flex",
        flexDirection: "row",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    compactClassText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    compactContent: {
        gap: 4,
    },
    compactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    compactLabel: {
        fontSize: 12,
        color: "#666",
        width: 70,
        fontWeight: "500",
    },
    compactValue: {
        fontSize: 12,
        color: "#333",
        flex: 1,
        flexWrap: "wrap",
    },
});

export default styles;
