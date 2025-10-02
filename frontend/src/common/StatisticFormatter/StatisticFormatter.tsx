import type { StatisticProps } from "antd";
import CountUp from "react-countup";

const StatisticFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
);

export default StatisticFormatter;