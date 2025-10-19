import { SaveOutlined } from "@ant-design/icons";
import { Button, Card, Collapse, Form } from "antd";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
    useAnnotator,
    type AnnotoriousOpenSeadragonAnnotator,
    type ImageAnnotation,
} from "@annotorious/react";
import type { FormInstance } from "antd";

import "./AnnotationPanel.css";

import type { FormValues } from "../EditAnnotation";
import AnnotationSettings from "./AnnotationSettings/AnnotationSettings";

import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

const { Panel } = Collapse;

interface AnnotationPanelProps {
    onSave: () => void;
    form: FormInstance<FormValues>;
}

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ onSave, form }) => {
    const annotator = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();
    const [activeAnnotation, setActiveAnnotation] = useState<string | undefined>(undefined);

    const handleRemove = (fieldName: number, removeFromForm: (index: number) => void) => {
        const annotations = form.getFieldValue("annotations") as FormValues["annotations"];
        const annotationToRemove = annotations?.[fieldName];

        if (annotationToRemove?.id && annotator) {
            annotator.removeAnnotation(annotationToRemove.id);
        }

        removeFromForm(fieldName);
    };

    const handleSelectAnnotation = (selected: ImageAnnotation[]) => {
        const annotations = form.getFieldValue("annotations") as FormValues["annotations"];

        if (selected.length > 0) {
            setActiveAnnotation(
                annotations.find((annotation) => annotation.id === selected[0].id)?.id
            );
        } else {
            setActiveAnnotation(undefined);
        }
    };

    const handleSelectCollapse = useCallback(
        (keys: string[]) => {
            if (!annotator) return;

            const activeKey = keys.length > 0 ? keys[0] : undefined;

            setActiveAnnotation(activeKey);
            annotator.setSelected(activeKey);
        },
        [annotator]
    );

    useEffect(() => {
        annotator?.on("selectionChanged", handleSelectAnnotation);

        return () => {
            annotator?.off("selectionChanged", handleSelectAnnotation);
        };
    }, [annotator]);

    return (
        <Card
            className="annotation-editor-wrapper"
            title="Аннотации"
            extra={
                <Button type="primary" onClick={onSave}>
                    <SaveOutlined /> Сохранить
                </Button>
            }
        >
            <div className="annotation-collapse-container">
                <Form.List name="annotations">
                    {(fields, { remove }) => (
                        <>
                            {fields.length > 0 ? (
                                <Collapse
                                    accordion
                                    activeKey={activeAnnotation}
                                    onChange={handleSelectCollapse}
                                >
                                    {fields.map((field, index) => {
                                        return (
                                            <Panel
                                                header={`Аннотация ${index + 1}`}
                                                key={
                                                    form.getFieldValue("annotations")[field.name].id
                                                }
                                                extra={
                                                    <Button
                                                        type="link"
                                                        danger
                                                        size="small"
                                                        onClick={() =>
                                                            handleRemove(field.name, remove)
                                                        }
                                                    >
                                                        Удалить
                                                    </Button>
                                                }
                                            >
                                                <AnnotationSettings name={field.name} form={form} />
                                            </Panel>
                                        );
                                    })}
                                </Collapse>
                            ) : (
                                <EmptyLabel />
                            )}
                        </>
                    )}
                </Form.List>
            </div>
        </Card>
    );
};

export default AnnotationPanel;
