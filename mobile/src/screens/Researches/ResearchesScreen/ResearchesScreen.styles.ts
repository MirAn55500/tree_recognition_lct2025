import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    addButton: {
        marginRight: 16,
        width: 50,
        height: 30,
        borderWidth: 0,
    },
    addButtonText: {
        color: "#fff",
    },
    researches: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    research: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#f8f8f8",
        height: 100,
        borderRadius: 20,
    },
    researchImage: {
        backgroundColor: "#f1f1f1",
        flex: 1,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    researchBody: {
        padding: 10,
        flex: 3,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    researchTitle: {
        fontWeight: "bold",
    },
    researchDescription: {
        flex: 1,
        width: "100%",
    },
    researchNoDescription: {
        color: "#abababff",
    },
    researchCreated: {
        gap: 5,
    },
    researchCreatedText: {
        color: "#8e8e8eff",
    },
});

export default styles;
