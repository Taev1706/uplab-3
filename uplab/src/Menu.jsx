import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { CartContext } from "./CartContext";
import { AuthContext } from "./AuthContext";

export default function Menu() {
    const { theme, toggleTheme, buttonStyles } = useContext(ThemeContext);
    const { totalCount } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);

    const isAdmin = user?.role === "admin";

    const linkStyle = ({ isActive }) => ({
        marginRight: "15px",
        textDecoration: "none",
        fontWeight: isActive ? "bold" : "normal",
        color: isActive ? "purple" : (theme === "dark" ? "#fff" : "#000")
    });

    return (
        <nav style={{ marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <NavLink to="/" end style={linkStyle}>Главная</NavLink>

            {!isAdmin && (
                <NavLink to="/cart" style={linkStyle}>Корзина (товаров: {totalCount})</NavLink>
            )}

            {!user ? (
                <NavLink to="/login" style={linkStyle}>Вход</NavLink>
            ) : (
                <>
                    <NavLink to="/dashboard" style={linkStyle}>
                        Личный кабинет ({isAdmin ? "Админ" : user.full_name})
                    </NavLink>
                    <button onClick={logout} style={{ ...buttonStyles, padding: "4px 10px" }}>
                        Выйти
                    </button>
                </>
            )}

            <button onClick={toggleTheme} style={{ ...buttonStyles, marginLeft: "auto" }}>
                {theme === "light" ? "Тёмная" : "Светлая"}
            </button>
        </nav>
    );
}