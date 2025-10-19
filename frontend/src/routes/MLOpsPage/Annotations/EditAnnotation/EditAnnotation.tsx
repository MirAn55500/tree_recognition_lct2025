import {
    OpenSeadragonAnnotator,
    useAnnotator,
    type AnnotoriousOpenSeadragonAnnotator,
    type ImageAnnotation,
} from "@annotorious/react";
import { ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Divider, Flex, Typography, Form, message, Tooltip } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";

import "@annotorious/react/annotorious-react.css";
import "./EditAnnotation.css";

import { classNamesOptions, diasesOptions, speciesOptions } from "./props";

import AnnotationPanel from "./AnnotationPanel/AnnotationPanel";
import AnnotationViewer from "./AnnotationViewer/AnnotationViewer";

import { type ClassNameType } from "#types/photo";
import type { Diases, Species } from "#types/dataset";

import { useGetPhotoStatusQuery, useUpdatePhotoStatisticsMutation } from "@services/api/photo.api";

import { generateAnnotation } from "@common/ImageWithStatics/AnnotationPhoto/utils";

const { Link, Title } = Typography;

export interface AnnotationData {
    id: string;
    coordinates: {
        1: { x: number; y: number };
        2: { x: number; y: number };
    };
    className: ClassNameType;
    hollows: number;
    cracks: number;
    stemDamage: number;
    crownDamage: number;
    fruitingBodies: number;
    dryBranches: number;
    species: Species;
    diseases: Diases;
}

export interface FormValues {
    annotations: AnnotationData[];
}

const EditAnnotation = () => {
    const navigate = useNavigate();
    const { datasetId, photoId: photoIdRaw } = useParams<{ datasetId: string; photoId: string }>();

    const photoId = Number(photoIdRaw);

    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

    const [form] = Form.useForm<FormValues>();

    const [updateStats] = useUpdatePhotoStatisticsMutation();
    const { data: photoStatus } = useGetPhotoStatusQuery(photoId);

    const goBack = useCallback(
        () => navigate(`/mlops/annotations/${datasetId}`),
        [navigate, datasetId]
    );

    useEffect(() => {
        if (photoStatus && !["processed", "annotated"].includes(photoStatus.status)) {
            goBack();
        } else if (photoStatus && photoStatus?.statistics && annotator) {
            const initData: { data: AnnotationData; annotation: ImageAnnotation }[] =
                photoStatus.statistics.results.map((item) => {
                    const annotation = generateAnnotation(photoId, item);

                    return {
                        data: {
                            id: annotation.id,
                            coordinates: {
                                1: { x: item.bbox[0], y: item.bbox[1] },
                                2: { x: item.bbox[2], y: item.bbox[3] },
                            },
                            className: item.class_name,
                            hollows: item.hollows * 100,
                            cracks: item.cracks * 100,
                            stemDamage: item.stem_damage * 100,
                            crownDamage: item.crown_damage * 100,
                            fruitingBodies: item.fruiting_bodies * 100,
                            dryBranches: item.dry_branches_percentage,
                            species: item.species[0],
                            diseases: item.diseases[0],
                        },
                        annotation,
                    };
                });

            annotator.setAnnotations(
                initData.map((item) => item.annotation),
                true
            );
            form.setFieldsValue({ annotations: initData.map((item) => item.data) });
        }
    }, [photoStatus, annotator]);

    useEffect(() => {
        if (annotator) {
            const handleCreate = (annotation: any) => {
                const currentAnnotations: AnnotationData[] =
                    form.getFieldValue("annotations") || [];

                const newAnnotation: AnnotationData = {
                    id: annotation.id,
                    coordinates: {
                        1: {
                            x: annotation.target.selector.geometry.bounds.minX,
                            y: annotation.target.selector.geometry.bounds.minY,
                        },
                        2: {
                            x: annotation.target.selector.geometry.bounds.maxX,
                            y: annotation.target.selector.geometry.bounds.maxY,
                        },
                    },
                    className: classNamesOptions[0].value,
                    species: speciesOptions[0].value,
                    diseases: diasesOptions[0].value,
                    hollows: 0,
                    cracks: 0,
                    stemDamage: 0,
                    crownDamage: 0,
                    fruitingBodies: 0,
                    dryBranches: 0,
                };

                form.setFieldValue("annotations", [...currentAnnotations, newAnnotation]);
            };

            const handleUpdate = (annotation: any) => {
                const currentAnnotations: AnnotationData[] =
                    form.getFieldValue("annotations") || [];
                const idx = currentAnnotations.findIndex((a) => a.id === annotation.id);
                if (idx === -1) return;

                const updated = { ...currentAnnotations[idx] };
                updated.coordinates = {
                    1: {
                        x: annotation.target.selector.geometry.bounds.minX,
                        y: annotation.target.selector.geometry.bounds.minY,
                    },
                    2: {
                        x: annotation.target.selector.geometry.bounds.maxX,
                        y: annotation.target.selector.geometry.bounds.maxY,
                    },
                };

                const newAnnotations = [...currentAnnotations];
                newAnnotations[idx] = updated;
                form.setFieldValue("annotations", newAnnotations);
            };

            annotator.on("updateAnnotation", handleUpdate);
            annotator.on("createAnnotation", handleCreate);

            return () => {
                try {
                    annotator.off("createAnnotation", handleCreate);
                    annotator.off("updateAnnotation", handleUpdate);
                } catch (err) {}
            };
        }
    }, [annotator, form]);

    const handleSave = async () => {
        try {
            if (!photoStatus || photoStatus.statistics === null) {
                throw new Error("Информация о фото не получена");
            }

            const values = await form.validateFields();
            await updateStats({
                id: photoId,
                filename: photoStatus.statistics.filename,
                results: values.annotations.map((annotation) => ({
                    bbox: [
                        annotation.coordinates[1].x,
                        annotation.coordinates[1].y,
                        annotation.coordinates[2].x,
                        annotation.coordinates[2].y,
                    ],
                    class_name: annotation.className,
                    species: [annotation.species],
                    species_confidence: [1],
                    hollows: annotation.hollows / 100,
                    cracks: annotation.cracks / 100,
                    stem_damage: annotation.stemDamage / 100,
                    crown_damage: annotation.crownDamage / 100,
                    fruiting_bodies: annotation.fruitingBodies / 100,
                    diseases: [annotation.diseases],
                    dry_branches_percentage: annotation.dryBranches,
                })),
            });
            message.success("Успешно обновлено!");
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <OpenSeadragonAnnotator drawingMode="click" tool="rectangle">
            <Form<FormValues> form={form} layout="vertical" className="edit-annotation-form">
                <Flex vertical className="edit-annotation-container">
                    <Flex className="edit-annotation-header">
                        <Link onClick={goBack}>
                            <ArrowLeftOutlined /> Назад
                        </Link>
                        <Flex className="edit-annotation-title">
                            <Title level={3}>Редактирование аннотаций</Title>
                            <Tooltip title="Для применения изменений по перемещению нажмите кнопку 'Обновить аннотацию' снизу или в любом месте окна просмотра изображения">
                                <InfoCircleOutlined className="edit-annotation-help" />
                            </Tooltip>
                        </Flex>
                    </Flex>
                    <Divider />
                    <Flex className="annotation-viewer-wrapper">
                        <AnnotationViewer photoId={photoId} />
                        <AnnotationPanel onSave={handleSave} form={form} />
                    </Flex>
                </Flex>
            </Form>
        </OpenSeadragonAnnotator>
    );
};

export default EditAnnotation;
