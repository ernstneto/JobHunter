import { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eff6ff",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    900: "#1e3a5f",
                },
                success: "#22c55e",
                warning: "#f59e0b",
                danger: "#ef4444",
            },
        },
    },
    plugins: [],
};

export default config;