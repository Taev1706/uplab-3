import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Login() {
    const navigate = useNavigate();
    const { buttonStyles } = useContext(ThemeContext);

    const handleLogin = () => {
        navigate("/dashboard", { state: { isAuth: true } });
    };

    return (
        <div>
            <h2>Вход в систему</h2>
            <button onClick={handleLogin} style={{ ...buttonStyles, marginTop: "10px" }}>Войти</button>
        </div>
    );
}