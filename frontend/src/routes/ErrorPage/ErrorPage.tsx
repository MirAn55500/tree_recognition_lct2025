import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

const { Title, Paragraph } = Typography;

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="error-page">
            <div className="error-card">
                <Title level={2}>Что-то пошло не так</Title>
                <Paragraph>Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова позже.</Paragraph>
                <div className="error-actions">
                    <Button type="primary" onClick={() => navigate(-1)}>
                        Назад
                    </Button>
                    <Button onClick={() => navigate('/')}>На главную</Button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
