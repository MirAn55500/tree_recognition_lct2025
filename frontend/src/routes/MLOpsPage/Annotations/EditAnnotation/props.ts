import { diases, species, type Diases } from "#types/dataset";
import { classNames, classNameToString } from "#types/photo";

export const classNamesOptions = [...classNames]
    .map((className) => ({
        label: classNameToString[className],
        value: className,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));

export const speciesOptions = species.map((item) => ({
    label: item,
    value: item,
}));

const HEALTHY_LABEL = "Здоров";
const diasesSorted = [...diases]
    .filter((d) => d !== (HEALTHY_LABEL as Diases))
    .sort((a, b) => a.localeCompare(b, "ru"));
if (diases.includes(HEALTHY_LABEL as Diases)) diasesSorted.unshift(HEALTHY_LABEL as Diases);

export const diasesOptions = diasesSorted.map((item) => ({
    label: item,
    value: item,
}));
