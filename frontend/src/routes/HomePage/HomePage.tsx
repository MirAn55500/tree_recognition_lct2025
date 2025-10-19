import { Row, Col, Card, Typography, Button, Steps, Tag, Space } from "antd";
import {
    RocketOutlined,
    CloudUploadOutlined,
    BarChartOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const HomePage = () => {
    const featuresData = [
        {
            title: "Вид растения",
            description: "Определение вида с указанием вероятности",
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
        },
        {
            title: "Состояние здоровья",
            description: "Диагностика заболеваний и оценка жизнеспособности",
            icon: <SafetyCertificateOutlined />,
            color: "#fa8c16",
        },
        {
            title: "Биометрические параметры",
            description: "Высота, диаметр кроны и ключевые метрики",
            icon: <BarChartOutlined />,
            color: "#1890ff",
        },
        {
            title: "Индекс повреждённости",
            description: "Взвешенная оценка состояния по нескольким параметрам",
            icon: <EnvironmentOutlined />,
            color: "#fa541c",
        },
    ];

    const steps = [
        {
            title: "Загрузка",
            description: "Загрузите одно или несколько изображений",
            icon: <CloudUploadOutlined />,
        },
        {
            title: "Анализ",
            description: "Модель обрабатывает снимки и формирует данные",
            icon: <BarChartOutlined />,
        },
        {
            title: "Результаты",
            description: "Изучите детальную статистику по каждому растению",
            icon: <EyeOutlined />,
        },
    ];

    const damageParams = [
        "Наличие дупла",
        "Трещины",
        "Повреждения ствола",
        "Повреждения кроны",
        "Процент сухих ветвей",
    ];

    return (
        <div style={{ padding: "24px" }}>
            <Row justify="center" style={{ marginBottom: 60, textAlign: "center" }}>
                <Col xs={24} lg={18}>
                    <Title level={1} style={{ marginBottom: 16 }}>
                        Мониторинг и диагностика зелёных насаждений на основе ИИ
                    </Title>
                    <Paragraph style={{ fontSize: "18px", color: "#666" }}>
                        Наше веб-приложение использует передовые алгоритмы компьютерного зрения для
                        автоматического анализа изображений зелёных насаждений. Загрузите фотографию
                        — и наша нейросетевая модель не только обнаружит на ней все деревья и
                        кустарники, но и предоставит по каждому из них детальный отчёт.
                    </Paragraph>
                    <Space size="middle">
                        <Button
                            type="primary"
                            size="large"
                            icon={<RocketOutlined />}
                            href="/research"
                        >
                            Начать анализ
                        </Button>
                        <Button size="large" icon={<EyeOutlined />} href="/gallery">
                            Посмотреть галерею
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[32, 32]} style={{ marginBottom: 60 }}>
                <Col xs={24}>
                    <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                        Что вы получите для каждого растения
                    </Title>
                </Col>
                <Col xs={24}>
                    <Row gutter={[16, 16]}>
                        {featuresData.map((item, index) => (
                            <Col xs={24} sm={12} md={6} key={index}>
                                <Card
                                    style={{
                                        textAlign: "center",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    styles={{
                                        body: {
                                            padding: "24px 16px",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                        },
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "32px",
                                                color: item.color,
                                                marginBottom: 16,
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <Title
                                            level={4}
                                            style={{ marginBottom: 8, minHeight: "32px" }}
                                        >
                                            {item.title}
                                        </Title>
                                        <Paragraph type="secondary" style={{ margin: 0 }}>
                                            {item.description}
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>

            <Row gutter={[32, 32]} style={{ marginBottom: 60 }}>
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <EnvironmentOutlined />
                                <span>Карта наблюдений</span>
                            </Space>
                        }
                        style={{ height: "100%" }}
                    >
                        <Paragraph>
                            На интерактивной карте отображаются все наблюдения за состоянием
                            деревьев с детальной информацией по каждому растению.
                        </Paragraph>
                        <div style={{ marginTop: 20 }}>
                            <Title level={5}>Для каждой точки отображается:</Title>
                            <ul>
                                <li>Взвешенный индекс повреждённости деревьев</li>
                                <li>Название болезни (при наличии)</li>
                                <li>Основные параметры состояния</li>
                                <li>Фотографии и детальная статистика</li>
                            </ul>
                        </div>
                        <Button
                            type="primary"
                            icon={<EnvironmentOutlined />}
                            href="/map"
                            style={{ marginTop: 16 }}
                        >
                            Перейти к карте
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <SafetyCertificateOutlined />
                                <span>Индекс повреждённости деревьев</span>
                            </Space>
                        }
                        style={{ height: "100%" }}
                    >
                        <Paragraph>
                            Специальный алгоритм рассчитывает взвешенный индекс повреждённости на
                            основе комплексной оценки состояния дерева.
                        </Paragraph>

                        <Title level={5}>Учитываемые параметры:</Title>
                        <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                            {damageParams.map((param, index) => (
                                <Col xs={24} sm={12} key={index}>
                                    <Tag
                                        color="blue"
                                        style={{
                                            margin: "2px",
                                            width: "100%",
                                            textAlign: "center",
                                        }}
                                    >
                                        {param}
                                    </Tag>
                                </Col>
                            ))}
                        </Row>

                        <div style={{ marginTop: 20 }}>
                            <Text type="secondary">
                                Индекс помогает быстро оценить общее состояние зелёных насаждений и
                                приоритезировать работы по уходу.
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[32, 32]} style={{ marginBottom: 60 }}>
                <Col xs={24}>
                    <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                        Как это работает
                    </Title>
                </Col>
                <Col xs={24}>
                    <Steps current={-1} labelPlacement="vertical">
                        {steps.map((step, index) => (
                            <Step
                                status="finish"
                                key={index}
                                title={step.title}
                                description={step.description}
                                icon={step.icon}
                            />
                        ))}
                    </Steps>
                </Col>
            </Row>

            <Row
                justify="center"
                style={{
                    backgroundColor: "#f0f8ff",
                    padding: "40px 24px",
                    borderRadius: "8px",
                    textAlign: "center",
                }}
            >
                <Col xs={24} lg={16}>
                    <Title level={3} style={{ marginBottom: 16 }}>
                        Начните сейчас
                    </Title>
                    <Paragraph style={{ fontSize: "16px", marginBottom: 24 }}>
                        Создайте новое исследование и получите первую аналитику уже через несколько
                        минут
                    </Paragraph>
                    <Button
                        type="primary"
                        size="large"
                        icon={<RocketOutlined />}
                        href="/research"
                        style={{ marginRight: 16 }}
                    >
                        Создать исследование
                    </Button>
                    <Button size="large" icon={<EnvironmentOutlined />} href="/map">
                        Посмотреть на карте
                    </Button>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 40 }}>
                <Col xs={24} md={8}>
                    <Card size="small" title="📊 Исследования" bordered={false}>
                        Храните все созданные исследования в виде карточек с фотографиями,
                        аннотациями и статистикой
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card size="small" title="🗺️ Карта" bordered={false}>
                        Просматривайте деревья на карте с метками и их описанием, анализируйте общую
                        статистику
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card size="small" title="🖼️ Галерея" bordered={false}>
                        Доступ ко всем загруженным фотографиям с попапами статистики по каждому
                        растению
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HomePage;
