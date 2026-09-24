import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { CartContext } from "./CartContext";

export default function Menu() {
    const { theme, toggleTheme, buttonStyles } = useContext(ThemeContext);
    const { totalCount } = useContext(CartContext);

    const linkStyle = ({ isActive }) => ({
        marginRight: "15px",
        textDecoration: "none",
        fontWeight: isActive ? "bold" : "normal",
        color: isActive ? "purple" : (theme === "dark" ? "#fff" : "#000")
    });

    return (
        <nav style={{ marginBottom: "20px" }}>
            <NavLink to="/" end style={linkStyle}>Главная</NavLink>
            <NavLink to="/cart" style={linkStyle}>Корзина (товаров: {totalCount})</NavLink>
            <NavLink to="/login" style={linkStyle}>Вход</NavLink>
            <NavLink to="/dashboard" style={linkStyle}>Личный кабинет</NavLink>

            <button onClick={toggleTheme} style={{ ...buttonStyles, marginLeft: "20px" }}>
                {theme === "light" ? "Тёмная" : "Светлая"}
            </button>
        </nav>
    );
}