import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@ant-design/react-native";
import { PhotoAnnotation } from "#types/photo";
import styles from "./AnnotationStatistics.styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface AnnotationStatisticsProps {
    statistics: PhotoAnnotation;
    hideAnnotationModal?: () => void;
    compact?: boolean;
    index?: number;
}

const AnnotationStatistics: React.FC<AnnotationStatisticsProps> = ({
    statistics,
    hideAnnotationModal,
    compact = false,
    index,
}) => {
    const getPlantClassLabel = (class_name: string) => {
        const classMap: Record<string, string> = {
            "a tree": "Дерево",
            tree: "Дерево",
            "a shrub": "Кустарник",
            shrub: "Кустарник",
            "a tree a shrub": "Дерево-кустарник",
            "tree a shrub": "Дерево-кустарник",
            "a tree shrub": "Дерево-кустарник",
            "tree shrub": "Дерево-кустарник",
        };
        return classMap[class_name] || class_name;
    };

    const getRoundedNumber = (value: number) => {
        return Math.round(value * 100) / 100;
    };

    const renderSpeciesCompact = () => {
        if (!statistics.species?.length || !statistics.species_confidence?.length) {
            return null;
        }

        const topSpecies = statistics.species[0];
        const topConfidence = Math.round(statistics.species_confidence[0] * 100);

        return (
            <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Вид:</Text>
                <Text style={styles.compactValue}>
                    {topSpecies} ({topConfidence}%)
                </Text>
            </View>
        );
    };

    const renderDefectsCompact = () => {
        const defects = [];

        if (statistics.hollows && statistics.hollows > 0) {
            defects.push({
                label: "Дупла",
                value: getRoundedNumber(statistics.hollows * 100),
            });
        }
        if (statistics.cracks && statistics.cracks > 0) {
            defects.push({ label: "Трещины", value: getRoundedNumber(statistics.cracks * 100) });
        }
        if (statistics.stem_damage && statistics.stem_damage > 0) {
            defects.push({ label: "Ствол", value: getRoundedNumber(statistics.stem_damage * 100) });
        }
        if (statistics.crown_damage && statistics.crown_damage > 0) {
            defects.push({
                label: "Крона",
                value: getRoundedNumber(statistics.crown_damage * 100),
            });
        }
        if (statistics.fruiting_bodies && statistics.fruiting_bodies > 0) {
            defects.push({
                label: "Пл.тела",
                value: getRoundedNumber(statistics.fruiting_bodies * 100),
            });
        }
        if (statistics.dry_branches_percentage && statistics.dry_branches_percentage > 0) {
            defects.push({
                label: "Ветви",
                value: getRoundedNumber(statistics.dry_branches_percentage),
            });
        }

        if (defects.length === 0) {
            return null;
        }

        return (
            <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Дефекты:</Text>
                <Text style={styles.compactValue} numberOfLines={1}>
                    {defects
                        .slice(0, 2)
                        .map((defect) => `${defect.label} ${defect.value}%`)
                        .join(", ")}
                    {defects.length > 2 && ` +${defects.length - 2}`}
                </Text>
            </View>
        );
    };

    const renderDiseasesCompact = () => {
        if (!statistics.diseases?.length) {
            return null;
        }

        return (
            <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Заболев.:</Text>
                <Text style={styles.compactValue} numberOfLines={1}>
                    {statistics.diseases[0]}
                </Text>
            </View>
        );
    };

    const renderSpecies = () => {
        if (!statistics.species?.length || !statistics.species_confidence?.length) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Вероятности видов</Text>
                {statistics.species_confidence.map((confidence, index) => (
                    <View key={index} style={styles.speciesItem}>
                        <View style={styles.speciesHeader}>
                            <Text style={styles.percentage}>{statistics.species?.[index]}</Text>
                            <Text style={styles.percentage}>{Math.round(confidence * 100)}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[styles.progressFill, { width: `${confidence * 100}%` }]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderDefects = () => {
        const defects = [];

        if (statistics.hollows && statistics.hollows > 0) {
            defects.push({
                label: "Дупла",
                value: getRoundedNumber(statistics.hollows * 100),
                color: "#fa8c16",
            });
        }
        if (statistics.cracks && statistics.cracks > 0) {
            defects.push({
                label: "Трещины",
                value: getRoundedNumber(statistics.cracks * 100),
                color: "#fa541c",
            });
        }
        if (statistics.stem_damage && statistics.stem_damage > 0) {
            defects.push({
                label: "Ствол",
                value: getRoundedNumber(statistics.stem_damage * 100),
                color: "#f5222d",
            });
        }
        if (statistics.crown_damage && statistics.crown_damage > 0) {
            defects.push({
                label: "Крона",
                value: getRoundedNumber(statistics.crown_damage * 100),
                color: "#722ed1",
            });
        }
        if (statistics.fruiting_bodies && statistics.fruiting_bodies > 0) {
            defects.push({
                label: "Плод. тела",
                value: getRoundedNumber(statistics.fruiting_bodies * 100),
                color: "#52c41a",
            });
        }
        if (statistics.dry_branches_percentage && statistics.dry_branches_percentage > 0) {
            defects.push({
                label: "Сухих ветвей",
                value: getRoundedNumber(statistics.dry_branches_percentage),
                color: "#eb2f96",
            });
        }

        if (defects.length === 0) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Дефекты</Text>
                <View style={styles.defectsContainer}>
                    {defects.map((defect, index) => (
                        <View
                            key={index}
                            style={[styles.defectTag, { backgroundColor: defect.color }]}
                        >
                            <Text style={styles.defectText}>
                                {defect.label}: {defect.value}%
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderDiseases = () => {
        if (!statistics.diseases?.length) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Заболевание</Text>
                <View style={styles.diseasesContainer}>
                    <View style={[styles.diseaseTag, { backgroundColor: "#f5222d" }]}>
                        <Text style={styles.diseaseText}>{statistics.diseases[0]}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactHeader}>
                    <View style={[styles.compactClassTag, { backgroundColor: "#1890ff" }]}>
                        <Text style={styles.compactClassText}>
                            {getPlantClassLabel(statistics.class_name)}
                        </Text>
                    </View>

                    <View style={[styles.compactClassTag, { backgroundColor: "#d518ffff" }]}>
                        <Text style={styles.compactClassText}>№ {index}</Text>
                    </View>
                </View>

                <View style={styles.compactContent}>
                    {renderSpeciesCompact()}
                    {renderDefectsCompact()}
                    {renderDiseasesCompact()}
                </View>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Статистика аннотации</Text>
                    <TouchableOpacity onPress={hideAnnotationModal} style={styles.closeButton}>
                        <Text style={styles.closeIcon}>×</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Класс</Text>
                            <View style={[styles.classTag, { backgroundColor: "#1890ff" }]}>
                                <Text style={styles.classText}>
                                    {getPlantClassLabel(statistics.class_name)}
                                </Text>
                            </View>
                        </View>
                        {renderSpecies()}
                        {renderDefects()}
                        {renderDiseases()}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AnnotationStatistics;
