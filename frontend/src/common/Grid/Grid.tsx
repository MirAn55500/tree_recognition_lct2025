import { Col, Row } from "antd";
import type { Key, ReactNode } from "react";

import EmptyLabel from "@common/EmptyLabel/EmptyLabel";

interface GridProps<T> {
    data?: T[];
    key?: keyof T;
    render: (item: T) => ReactNode;
    className?: string;
}

const Grid = <T,>({ data, key, render, className }: GridProps<T>) => {
    return (
        <>
            {data && data.length > 0 && (
                <Row gutter={[16, 16]} className={`grid-container ${className ?? ""}`}>
                    {data.map((item, index) => (
                        <Col span={8} key={key ? (item[key] as Key) : index}>
                            {render(item)}
                        </Col>
                    ))}
                </Row>
            )}
            {(!data || data.length === 0) && <EmptyLabel />}
        </>
    );
};

export default Grid;
