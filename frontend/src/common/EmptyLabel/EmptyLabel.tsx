import { Empty, Typography } from "antd";

interface EmptyLabelProps {
    placeholder?: string;
}

const EmptyLabel: React.FC<EmptyLabelProps> = ({ placeholder = "Пусто" }) => {
    return (
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            styles={{ image: { height: 60 } }}
            description={<Typography.Text disabled>{placeholder}</Typography.Text>}
        />
    );
};

export default EmptyLabel;
