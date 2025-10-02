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

interface FormInputProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    rules?: RegisterOptions<TFieldValues>;
    placeholder?: string;
    disabled?: boolean;
    errors?: FieldErrors<TFieldValues>;
}

const FormInput = <TFieldValues extends FieldValues>({
    control,
    name,
    rules,
    placeholder,
    disabled,
    errors,
}: FormInputProps<TFieldValues>) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            disabled={disabled}
            render={({ field: { onChange, value } }) => (
                <>
                    <Input
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                    />
                    {errors && <ErrorText errors={errors} name={name} />}
                </>
            )}
        />
    );
};

export default FormInput;
