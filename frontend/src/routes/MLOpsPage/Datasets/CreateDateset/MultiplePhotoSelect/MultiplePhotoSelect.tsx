import React from "react";
import { Popover, Image, Button } from "antd";

import Grid from "@common/Grid/Grid";

import getPhotoLink from "@utils/getPhotoLink";

import "./MultiplePhotoSelect.css";

interface MultiplePhotoSelectProps {
    value?: number[];
    onChange?: (value: number[]) => void;
    photoIds: number[];
}

const MultiplePhotoSelect: React.FC<MultiplePhotoSelectProps> = ({
    value = [],
    onChange,
    photoIds,
}) => {
    const toggle = (id: number) => {
        const exists = value.includes(id);
        const next = exists ? value.filter((v) => v !== id) : [...value, id];
        onChange?.(next);
    };

    const selectedSet = new Set(value);

    return (
        <Popover
            content={
                <div className="mps-popover">
                    <div className="mps-inner">
                        <Grid
                            data={photoIds}
                            render={(id) => (
                                <div className="mps-item" onClick={() => toggle(id as number)}>
                                    <Image
                                        src={getPhotoLink(id as number)}
                                        width={120}
                                        height={80}
                                        preview={false}
                                        className="mps-img"
                                    />
                                    {selectedSet.has(id as number) && (
                                        <div className="mps-badge">✓</div>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            }
            trigger={["click"]}
            placement="bottomLeft"
        >
            <Button className="mps-trigger">
                {value.length > 0 ? `Выбрано ${value.length} фотографий` : "Выберите фотографии"}
            </Button>
        </Popover>
    );
};

export default MultiplePhotoSelect;
