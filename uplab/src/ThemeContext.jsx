import { createContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
    };

    const appStyles = {
        backgroundColor: theme === "dark" ? "#222" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        minHeight: "100vh",
        padding: "20px"
    };

    const buttonStyles = {
        backgroundColor: theme === "dark" ? "#444" : "#e0e0e0",
        color: theme === "dark" ? "#fff" : "#000",
        border: theme === "dark" ? "1px solid #666" : "1px solid #ccc",
        padding: "8px 16px",
        cursor: "pointer",
        borderRadius: "4px"
    };

    const inputStyles = {
        backgroundColor: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        border: theme === "dark" ? "1px solid #555" : "1px solid #ccc",
        padding: "6px 10px",
        borderRadius: "4px",
        outline: "none"
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, appStyles, buttonStyles, inputStyles }}>
            {children}
        </ThemeContext.Provider>
    );
}