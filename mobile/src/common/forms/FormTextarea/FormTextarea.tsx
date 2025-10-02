import React from "react";
import {
    Control,
    Controller,
    FieldErrors,
    FieldValues,
    Path,
    RegisterOptions,
} from "react-hook-form";
import { Input } from "@ant-design/react-native";
import ErrorText from "../ErrorText/ErrorText";

interface FormTextareaProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    rules?: RegisterOptions<TFieldValues>;
    placeholder?: string;
    errors?: FieldErrors<TFieldValues>;
}

const FormTextarea = <TFieldValues extends FieldValues>({
    control,
    name,
    rules,
    placeholder,
    errors,
}: FormTextareaProps<TFieldValues>) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                    <Input.TextArea
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        autoSize={{ minRows: 4 }}
                        allowClear
                    />
                    {errors && <ErrorText errors={errors} name={name} />}
                </>
            )}
        />
    );
};

export default FormTextarea;
