import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@contexts": path.resolve(__dirname, "src/contexts"),
            "@common": path.resolve(__dirname, "src/common"),
            "@types": path.resolve(__dirname, "src/types"),
            "@hooks": path.resolve(__dirname, "src/hooks"),
            "@services": path.resolve(__dirname, "src/services"),
            "@utils": path.resolve(__dirname, "src/utils"),
        },
    },
});
