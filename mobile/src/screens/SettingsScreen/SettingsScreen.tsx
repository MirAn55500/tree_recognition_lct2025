import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Switch, Button, WhiteSpace, Text, Toast } from "@ant-design/react-native";

import useAppSelector from "#hooks/useAppSelector";
import useAppDispatch from "#hooks/useAppDispatch";

import {
    incrementRetryCount,
    removePendingAction,
    setSyncing,
    toggleOnlineStatus,
} from "services/slices/onlineStatus.slice";
import { useProcessPhotoMutation, useUploadPhotoMutation } from "services/api/photo.api";
import { useCreateResearchMutation } from "services/api/research.api";

const SettingsScreen = () => {
    const pendingActions = useAppSelector((state) => state.onlineStatus.pendingActions);
    const isOnline = useAppSelector((state) => state.onlineStatus.isOnline);
    const isChecking = useAppSelector((state) => state.onlineStatus.isChecking);
    const isSyncing = useAppSelector((state) => state.onlineStatus.isSyncing);
    const dispatch = useAppDispatch();

    const [uploadPhoto] = useUploadPhotoMutation();
    const [processPhoto] = useProcessPhotoMutation();
    const [createResearch] = useCreateResearchMutation();

    const toggleOnlineStatusCallback = () => {
        dispatch(toggleOnlineStatus());
    };

    const handleSync = async () => {
        if (pendingActions.length === 0) {
            Toast.info("Нет данных для синхронизации", undefined, undefined, false);
            return;
        }

        Toast.loading("Синхронизация...", 0);

        try {
            let successCount = 0;
            let failedCount = 0;

            dispatch(setSyncing(true));

            try {
                for (const action of pendingActions) {
                    try {
                        const { researchData, photos } = action.payload;

                        const photoIds: number[] = [];

                        for (const photo of photos) {
                            try {
                                const uploadResult = await uploadPhoto({
                                    file: photo.file,
                                    latitude: photo.latitude,
                                    longitude: photo.longitude,
                                }).unwrap();

                                if (uploadResult.photo_id) {
                                    photoIds.push(uploadResult.photo_id);

                                    await processPhoto(uploadResult.photo_id);
                                }
                            } catch (error) {
                                console.error("Failed to upload photo:", error);
                                throw new Error(`Photo upload failed: ${error}`);
                            }
                        }

                        try {
                            await createResearch({
                                ...researchData,
                                photo_ids: photoIds,
                            });
                        } catch (error) {
                            console.error("Failed to create research:", error);
                            throw new Error(`Research creation failed: ${error}`);
                        }
                        successCount++;

                        dispatch(removePendingAction(action.id));
                    } catch (error) {
                        console.error(`Failed to sync action ${action.id}:`, error);
                        failedCount++;

                        dispatch(incrementRetryCount(action.id));
                    }
                }
            } finally {
                dispatch(setSyncing(false));
            }

            const result = { success: successCount, failed: failedCount };

            Toast.removeAll();

            if (result.failed === 0) {
                Toast.success(
                    `Успешно синхронизировано: ${result.success}`,
                    undefined,
                    undefined,
                    false
                );
            } else {
                Toast.info(
                    `Синхронизировано: ${result.success}, Ошибок: ${result.failed}`,
                    undefined,
                    undefined,
                    false
                );
            }
        } catch (error) {
            console.error(error);
            Toast.removeAll();
            Toast.fail("Ошибка синхронизации", undefined, undefined, false);
        }
    };

    const handleToggle = (checked: boolean) => {
        toggleOnlineStatusCallback();
    };

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.settingItem}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingText}>Режим онлайн</Text>
                        {isChecking ? (
                            <ActivityIndicator size="small" color="#1890ff" />
                        ) : (
                            <Switch checked={isOnline} onChange={handleToggle} />
                        )}
                    </View>
                    <Text style={styles.settingDescription}>
                        {isChecking
                            ? "Проверка соединения..."
                            : isOnline
                            ? "Онлайн-режим"
                            : "Оффлайн-режим"}
                    </Text>
                </View>

                <WhiteSpace size="xl" />

                <Button
                    type="primary"
                    onPress={handleSync}
                    style={styles.syncButton}
                    disabled={!isOnline || isSyncing || pendingActions.length === 0}
                    loading={isSyncing}
                >
                    <Text>
                        {isSyncing
                            ? "Синхронизация..."
                            : `Синхронизировать все данные (${pendingActions.length})`}
                    </Text>
                </Button>

                {pendingActions.length > 0 && (
                    <Text style={styles.pendingInfo}>
                        В очереди: {pendingActions.length} исследование(ий)
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    settingItem: {
        alignItems: "center",
        marginBottom: 30,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    settingText: {
        fontSize: 18,
        fontWeight: "500",
        marginRight: 15,
    },
    settingDescription: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    syncButton: {
        borderRadius: 8,
    },
    pendingInfo: {
        marginTop: 10,
        fontSize: 12,
        color: "#999",
        textAlign: "center",
    },
});

export default SettingsScreen;
