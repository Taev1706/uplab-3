import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { AuthContext } from "./AuthContext";
import { loginUser, registerUser } from "./api/auth";

export default function Login() {
    const navigate = useNavigate();
    const { theme, buttonStyles, inputStyles } = useContext(ThemeContext);
    const { login } = useContext(AuthContext);

    const [isRegister, setIsRegister] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (isRegister && !fullName.trim()) {
            setError("Пожалуйста, введите ваше имя");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            setError("Введите корректный email адрес");
            return;
        }

        if (password.length < 4) {
            setError("Пароль должен содержать не менее 4 символов");
            return;
        }

        try {
            if (isRegister) {
                const userData = await registerUser(email, password, fullName, address, phone);
                login(userData);
                navigate("/dashboard");
            } else {
                const userData = await loginUser(email, password);
                login(userData);
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || "Произошла ошибка");
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError(null);
    };

    const boxStyle = {
        maxWidth: "360px",
        margin: "40px auto",
        padding: "16px",
        border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
        borderRadius: "4px",
        boxSizing: "border-box"
    };

    return (
        <div style={boxStyle}>
            <h2 style={{ marginBottom: "15px", textAlign: "center" }}>
                {isRegister ? "Регистрация" : "Вход в систему"}
            </h2>

            {error && <p style={{ color: "#e53935", marginBottom: "10px", fontSize: "0.85em" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {isRegister && (
                    <div>
                        <label style={{ display: "block", marginBottom: "3px", fontSize: "0.85em" }}>Имя и фамилия:</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: "block", marginBottom: "3px", fontSize: "0.85em" }}>Email (Логин):</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                    />
                </div>

                {isRegister && (
                    <>
                        <div>
                            <label style={{ display: "block", marginBottom: "3px", fontSize: "0.85em" }}>Телефон:</label>
                            <input
                                type="tel"
                                placeholder="+7 (999) 000-00-00"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "3px", fontSize: "0.85em" }}>Основной адрес:</label>
                            <input
                                type="text"
                                placeholder="Город, улица, дом, кв"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                            />
                        </div>
                    </>
                )}

                <div>
                    <label style={{ display: "block", marginBottom: "3px", fontSize: "0.85em" }}>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                    />
                </div>

                <button type="submit" style={{ ...buttonStyles, marginTop: "6px", width: "100%" }}>
                    {isRegister ? "Зарегистрироваться" : "Войти"}
                </button>

                <button
                    type="button"
                    onClick={toggleMode}
                    style={{ ...buttonStyles, width: "100%" }}
                >
                    {isRegister ? "Уже есть аккаунт? Войти" : "Зарегистрировать новый аккаунт"}
                </button>
            </form>
        </div>
    );
}