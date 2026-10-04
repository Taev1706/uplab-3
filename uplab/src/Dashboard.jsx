import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { ThemeContext } from "./ThemeContext";
import { getServices, updateServiceDiscount } from "./api/services";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./api/categories";
import { getUsers, updateUserProfile } from "./api/auth";
import { getCoupons, createCoupon, deleteCoupon } from "./api/coupons";
import { getOrders, deleteOrder } from "./api/orders";

export default function Dashboard() {
    const { user, login } = useContext(AuthContext);
    const { theme, buttonStyles, inputStyles } = useContext(ThemeContext);

    const [profileName, setProfileName] = useState(user?.full_name || "");
    const [profileEmail, setProfileEmail] = useState(user?.email || "");
    const [profilePhone, setProfilePhone] = useState(user?.phone || "");
    const [profileAddress, setProfileAddress] = useState(user?.address || "");
    const [profilePassword, setProfilePassword] = useState("");

    const [adminSearch, setAdminSearch] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [serviceDiscount, setServiceDiscount] = useState("");

    const [couponsList, setCouponsList] = useState([]);
    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState("");
    const [couponTargetUser, setCouponTargetUser] = useState("");

    const [usersList, setUsersList] = useState([]);
    const [ordersList, setOrdersList] = useState([]);
    const [statusMessage, setStatusMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const isAdmin = user?.role === "admin";
    const boxStyle = {
        padding: "14px",
        border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
        borderRadius: "4px",
        marginBottom: "15px",
        width: "100%",
        boxSizing: "border-box"
    };

    const loadData = async () => {
        setErrorMessage(null);
        try {
            const [servData, usersData, coupData, catData] = await Promise.all([
                getServices(),
                getUsers(),
                getCoupons(),
                getCategories()
            ]);
            setServices(servData);
            setUsersList(usersData);
            setCouponsList(coupData);
            setCategories(catData);

            if (servData.length > 0) setSelectedServiceId(servData[0].service_id);
        } catch (err) {
            setErrorMessage(err.message || "Ошибка подключения к серверу");
        }
    };

    const loadOrders = async () => {
        if (!user) return;
        try {
            const data = await getOrders(user.user_id, isAdmin);
            setOrdersList(data);
        } catch (err) {
            setErrorMessage(err.message || "Не удалось загрузить заказы");
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
        loadOrders();
    }, [user, isAdmin]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            const updated = await updateUserProfile(
                user.user_id,
                profileName,
                profileEmail,
                profilePassword,
                profileAddress,
                profilePhone
            );
            login({ ...user, ...updated });
            setProfilePassword("");
            setStatusMessage("Профиль успешно обновлен");
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await createCategory(newCategoryName);
            setStatusMessage("Категория добавлена");
            setNewCategoryName("");
            loadData();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!editingCategoryName.trim()) return;
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await updateCategory(id, editingCategoryName);
            setEditingCategoryId(null);
            setStatusMessage("Категория обновлена");
            loadData();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await deleteCategory(id);
            setStatusMessage("Категория удалена");
            loadData();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleUpdateServiceDiscount = async (e) => {
        e.preventDefault();
        const discNum = Number(serviceDiscount);
        if (discNum < 0 || discNum > 99) {
            setErrorMessage("Скидка должна быть от 0 до 99%");
            return;
        }
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await updateServiceDiscount(selectedServiceId, discNum);
            setStatusMessage("Скидка обновлена");
            loadData();
            setServiceDiscount("");
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        const discNum = Number(newCouponDiscount);
        if (discNum < 1 || discNum > 99) {
            setErrorMessage("Скидка купона от 1 до 99%");
            return;
        }
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await createCoupon({
                code: newCouponCode,
                discount_percent: discNum,
                user_id: couponTargetUser || null
            });
            setStatusMessage("Купон создан");
            setNewCouponCode("");
            setNewCouponDiscount("");
            setCouponTargetUser("");
            loadData();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleDeleteCoupon = async (id) => {
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await deleteCoupon(id);
            setStatusMessage("Купон удален");
            loadData();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        setStatusMessage(null);
        setErrorMessage(null);
        try {
            await deleteOrder(orderId);
            setStatusMessage("Чек заказа удален");
            loadOrders();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    if (!user) {
        return (
            <div style={{ maxWidth: "550px", margin: "40px auto", textAlign: "center" }}>
                <h2>Личный кабинет</h2>
                <p style={{ marginTop: "10px" }}>Сначала войдите в систему.</p>
                <Link to="/login" style={{ display: "inline-block", marginTop: "15px", ...buttonStyles, textDecoration: "none" }}>
                    Войти
                </Link>
            </div>
        );
    }

    const filteredServices = services.filter(s =>
        s.service_id.toString().includes(adminSearch.trim()) ||
        s.name.toLowerCase().includes(adminSearch.toLowerCase().trim())
    );

    const filteredCoupons = couponsList.filter(c =>
        c.coupon_id.toString().includes(adminSearch.trim()) ||
        c.code.toLowerCase().includes(adminSearch.toLowerCase().trim())
    );

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 10px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2>Личный кабинет: {user.full_name}</h2>
                <p style={{ margin: "5px 0" }}>Роль: {isAdmin ? "Администратор" : "Клиент"}</p>
                {statusMessage && <p style={{ color: "green", marginTop: "8px" }}>{statusMessage}</p>}
                {errorMessage && (
                    <div style={{ padding: "8px 12px", border: "1px solid red", borderRadius: "4px", marginTop: "8px", color: "red" }}>
                        {errorMessage}
                    </div>
                )}
            </div>

            <div style={boxStyle}>
                <h3>Профиль пользователя</h3>
                <form onSubmit={handleSaveProfile} style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9em" }}>Имя:</label>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9em" }}>Логин (Email):</label>
                        <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9em" }}>Телефон:</label>
                        <input
                            type="tel"
                            placeholder="+7 (999) 000-00-00"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9em" }}>Основной адрес:</label>
                        <input
                            type="text"
                            placeholder="Город, улица, дом, кв"
                            value={profileAddress}
                            onChange={(e) => setProfileAddress(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9em" }}>Новый пароль:</label>
                        <input
                            type="password"
                            placeholder="Оставьте пустым, если не меняете"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            style={{ ...inputStyles, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <button type="submit" style={{ ...buttonStyles, alignSelf: "flex-start", marginTop: "4px" }}>
                        Сохранить изменения
                    </button>
                </form>

                {!isAdmin && user.personal_coupon && (
                    <p style={{ marginTop: "12px", fontSize: "0.95em" }}>
                        Ваш купон: <strong>{user.personal_coupon}</strong> (-{user.personal_discount}%)
                    </p>
                )}
            </div>

            <div style={boxStyle}>
                <h3>{isAdmin ? "Все заказы клиентов" : "Мои заказы"}</h3>
                {ordersList.length === 0 ? (
                    <p style={{ marginTop: "10px" }}>Заказов пока нет.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                        {ordersList.map((o) => (
                            <li key={o.order_id} style={{
                                padding: "10px 0",
                                borderBottom: theme === "dark" ? "1px solid #333" : "1px solid #eee"
                            }}>
                                <div><strong>Заказ от {o.created_at?.split("T")[0]}</strong></div>
                                {isAdmin && <div style={{ fontSize: "0.9em" }}>Клиент: {o.full_name} ({o.email})</div>}
                                <div style={{ fontSize: "0.9em", margin: "3px 0" }}>Товары: {o.items_summary}</div>
                                <div style={{ fontSize: "0.9em", opacity: 0.85 }}>Телефон: {o.phone} | Адрес: {o.address}</div>
                                <div style={{ marginTop: "4px", fontSize: "0.95em" }}>
                                    Изначальная цена: {Number(o.subtotal_amount).toLocaleString()} ₽ |
                                    Скидка: {Number(o.discount_amount).toLocaleString()} ₽ |
                                    <strong> Итого: {Number(o.total_amount).toLocaleString()} ₽</strong>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteOrder(o.order_id)}
                                        style={{ ...buttonStyles, marginTop: "8px", padding: "3px 8px", fontSize: "0.85em" }}
                                    >
                                        Удалить чек
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isAdmin && (
                <div>
                    <div style={boxStyle}>
                        <h4>Поиск</h4>
                        <input
                            type="text"
                            placeholder="Поиск по ID или коду..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            style={{ ...inputStyles, width: "100%", marginTop: "8px", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={boxStyle}>
                        <h4>Категории (строго уникальные)</h4>
                        <form onSubmit={handleCreateCategory} style={{ margin: "10px 0", display: "flex", gap: "8px" }}>
                            <input
                                type="text"
                                placeholder="Новая категория"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                style={{ ...inputStyles, flex: 1 }}
                            />
                            <button type="submit" style={buttonStyles}>Добавить</button>
                        </form>

                        <ul style={{ listStyle: "none", padding: 0, marginTop: "8px" }}>
                            {categories.map((c) => (
                                <li key={c.category_id} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
                                    {editingCategoryId === c.category_id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingCategoryName}
                                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                                style={{ ...inputStyles, marginRight: "6px", flex: 1 }}
                                            />
                                            <button onClick={() => handleUpdateCategory(c.category_id)} style={buttonStyles}>Ок</button>
                                            <button onClick={() => setEditingCategoryId(null)} style={{ ...buttonStyles, marginLeft: "4px" }}>Отмена</button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ flex: 1 }}>{c.name} (ID: {c.category_id})</span>
                                            <button onClick={() => { setEditingCategoryId(c.category_id); setEditingCategoryName(c.name); }} style={{ ...buttonStyles, padding: "2px 6px" }}>Изменить</button>
                                            <button onClick={() => handleDeleteCategory(c.category_id)} style={{ ...buttonStyles, marginLeft: "4px", padding: "2px 6px" }}>Удалить</button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={boxStyle}>
                        <h4>Скидки на товары (макс 99%)</h4>
                        <form onSubmit={handleUpdateServiceDiscount} style={{ margin: "10px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} style={{ ...inputStyles, flex: 1 }}>
                                {filteredServices.map((s) => (
                                    <option key={s.service_id} value={s.service_id}>
                                        ID {s.service_id}: {s.name} ({s.discount_percent}%)
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="%"
                                value={serviceDiscount}
                                onChange={(e) => setServiceDiscount(e.target.value)}
                                style={{ ...inputStyles, width: "60px" }}
                            />
                            <button type="submit" style={buttonStyles}>Сохранить</button>
                        </form>
                    </div>

                    <div style={boxStyle}>
                        <h4>Купоны</h4>
                        <form onSubmit={handleCreateCoupon} style={{ margin: "10px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                placeholder="Код"
                                value={newCouponCode}
                                onChange={(e) => setNewCouponCode(e.target.value)}
                                style={{ ...inputStyles, width: "100px" }}
                            />
                            <input
                                type="number"
                                min="1"
                                max="99"
                                placeholder="%"
                                value={newCouponDiscount}
                                onChange={(e) => setNewCouponDiscount(e.target.value)}
                                style={{ ...inputStyles, width: "50px" }}
                            />
                            <select value={couponTargetUser} onChange={(e) => setCouponTargetUser(e.target.value)} style={{ ...inputStyles, flex: 1 }}>
                                <option value="">Для всех</option>
                                {usersList.map((u) => (
                                    <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                                ))}
                            </select>
                            <button type="submit" style={buttonStyles}>Создать</button>
                        </form>

                        <ul style={{ listStyle: "none", padding: 0, marginTop: "8px" }}>
                            {filteredCoupons.map((coup) => (
                                <li key={coup.coupon_id} style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>{coup.code} (-{coup.discount_percent}%) {coup.user_name ? `для ${coup.user_name}` : "(Общий)"}</span>
                                    <button onClick={() => handleDeleteCoupon(coup.coupon_id)} style={{ ...buttonStyles, padding: "2px 6px" }}>Удалить</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}