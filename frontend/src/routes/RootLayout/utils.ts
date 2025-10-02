export const findMatchingPrefix = (prefixes: string[], path: string) => {
    const orderedPrefixes = prefixes.filter((p) => p !== "/").concat("/");
    const pattern = new RegExp(`^(${orderedPrefixes.join("|")})`);
    const match = path.match(pattern);

    return match ? match[1] : null;
};
