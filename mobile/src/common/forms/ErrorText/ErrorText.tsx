import { FieldErrors, FieldValues } from "react-hook-form";
import { Text } from "@ant-design/react-native";

import styles from "./ErrorText.style";

interface ErrorTextProps<TFieldValues extends FieldValues> {
    errors: FieldErrors<TFieldValues>;
    name: string;
}

const ErrorText = <TFieldValues extends FieldValues>({
    errors,
    name,
}: ErrorTextProps<TFieldValues>) => {
    return (
        <>
            {errors[name] && errors[name]?.message && typeof errors[name].message === "string" && (
                <Text style={styles.errorText}>{errors[name].message}</Text>
            )}
        </>
    );
};

export default ErrorText;
