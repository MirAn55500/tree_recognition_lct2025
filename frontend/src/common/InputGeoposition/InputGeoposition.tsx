import { Button, Input, Space } from "antd";
import { useContext } from "react";
import { CloseOutlined, GlobalOutlined } from "@ant-design/icons";

import "./InputGeopostion.css";

import ModalContext from "@contexts/ModalContext";
import MapComponent from "@common/Map/MapComponent";

export type InputGeopositionValue = [number, number];

interface InputGeopositionProps {
    value?: InputGeopositionValue;
    onChange?: (newValue?: InputGeopositionValue) => void;
    fullWidth?: boolean;
}

const InputGeoposition: React.FC<InputGeopositionProps> = ({ value, onChange, fullWidth }) => {
    const { open, close } = useContext(ModalContext);

    const openMapModal = () => {
        const initPoint: InputGeopositionValue = value || [37.623879, 55.751115];

        onChange && onChange(initPoint);
        open({
            content: (
                <MapComponent
                    controls={["select"]}
                    initFeatures={[
                        {
                            type: "Feature",
                            geometry: { type: "Point", coordinates: initPoint },
                            properties: { mode: "point" },
                        },
                    ]}
                    handleChanges={(changes) =>
                        changes &&
                        onChange &&
                        onChange(changes.geometry.coordinates as InputGeopositionValue)
                    }
                />
            ),
            props: {
                title: "Выберите местоположение на карте",
                className: "map-modal-container",
                cancelText: "Отменить",
                onOk: () => close(),
                handleCancel: () => onChange && onChange(undefined),
            },
        });
    };

    return (
        <Space.Compact block={fullWidth}>
            <Input
                value={value ? `${value[0]}, ${value[1]}` : undefined}
                disabled
                readOnly
                placeholder="Выберите геопозицию"
            />
            <Button onClick={() => onChange && onChange(undefined)}>
                <CloseOutlined />
            </Button>
            <Button onClick={openMapModal}>
                <GlobalOutlined />
            </Button>
        </Space.Compact>
    );
};

export default InputGeoposition;
