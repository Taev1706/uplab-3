import { useLocation } from "react-router-dom";

export default function Dashboard() {
    const location = useLocation();
    const isAuth = location.state?.isAuth;

    return (
        <div>
            <h2>Личный кабинет</h2>
            {isAuth ? (<p>Вы успешно авторизовались в системе!</p>) : (<p>Сначала войдите в систему.</p>)}
        </div>
    );
}