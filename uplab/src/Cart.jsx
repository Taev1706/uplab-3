import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";
import { AuthContext } from "./AuthContext";
import { createOrder } from "./api/orders";
import { getCoupons } from "./api/coupons";

export default function Cart() {
    const {
        cart,
        addToCart,
        decreaseFromCart,
        removeFromCart,
        clearCart,
        subtotalPrice,
        totalPrice,
        appliedCoupon,
        couponDiscountAmount,
        applyCoupon,
        removeCoupon
    } = useContext(CartContext);

    const { theme, buttonStyles, inputStyles } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);

    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState(null);

    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [orderReceipt, setOrderReceipt] = useState(null);
    const [orderError, setOrderError] = useState(null);

    useEffect(() => {
        if (user?.address && !address) {
            setAddress(user.address);
        }
        if (user?.phone && !phone) {
            setPhone(user.phone);
        }
    }, [user]);

    if (user?.role === "admin") {
        return (
            <div>
                <h2>Корзина</h2>
                <p style={{ marginTop: "10px" }}>Администраторам доступ к корзине закрыт.</p>
            </div>
        );
    }

    const handleApplyCoupon = async () => {
        const code = couponInput.trim();
        setCouponError(null);
        if (!code) {
            setCouponError("Введите купон");
            return;
        }

        try {
            const coupons = await getCoupons();
            const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

            if (found) {
                applyCoupon(found.code, found.discount_percent);
                setCouponInput("");
                return;
            }

            if (user?.personal_coupon && user.personal_coupon.toUpperCase() === code.toUpperCase()) {
                applyCoupon(user.personal_coupon, user.personal_discount || 10);
                setCouponInput("");
                return;
            }

            if (code.toUpperCase() === "PROMO10") {
                applyCoupon("PROMO10", 10);
                setCouponInput("");
                return;
            }

            setCouponError("Недействительный купон");
        } catch (err) {
            setCouponError(err.message || "Ошибка проверки купона");
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setOrderError(null);

        if (!user) {
            setOrderError("Чтобы оформить заказ, зарегистрируйтесь");
            return;
        }

        if (!phone.trim() || !address.trim()) {
            setOrderError("Заполните номер телефона и адрес доставки");
            return;
        }

        try {
            const placedOrder = await createOrder({
                user_id: user.user_id,
                phone: phone.trim(),
                address: address.trim(),
                subtotal_amount: subtotalPrice,
                discount_amount: couponDiscountAmount,
                total_amount: totalPrice,
                items: cart
            });

            setOrderReceipt({
                order_id: placedOrder.order_id,
                phone: placedOrder.phone,
                address: placedOrder.address,
                items: [...cart],
                subtotal: subtotalPrice,
                discount: couponDiscountAmount,
                total: totalPrice,
                couponCode: appliedCoupon?.code
            });

            clearCart();
        } catch (err) {
            setOrderError(err.message || "Ошибка оформления");
        }
    };

    const boxStyle = {
        padding: "12px",
        border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
        borderRadius: "4px",
        marginTop: "15px",
        maxWidth: "380px"
    };

    return (
        <div>
            <h2>Корзина</h2>

            {orderReceipt && (
                <div style={{ ...boxStyle, borderColor: "green", marginBottom: "20px" }}>
                    <h3 style={{ color: "green", marginBottom: "8px" }}>Чек заказа #{orderReceipt.order_id}</h3>
                    <p>Телефон: {orderReceipt.phone}</p>
                    <p>Адрес: {orderReceipt.address}</p>
                    <hr style={{ margin: "8px 0" }} />
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {orderReceipt.items.map((i) => (
                            <li key={i.name} style={{ fontSize: "0.9em", marginBottom: "4px" }}>
                                {i.name} x {i.count} = {(i.price * i.count).toLocaleString()} ₽
                            </li>
                        ))}
                    </ul>
                    <hr style={{ margin: "8px 0" }} />
                    <p>Изначальная цена: <strong>{orderReceipt.subtotal.toLocaleString()} ₽</strong></p>
                    <p>Скидка: {orderReceipt.discount > 0 ? `-${orderReceipt.discount.toLocaleString()} ₽ (${orderReceipt.couponCode})` : "0 ₽"}</p>
                    <p style={{ fontSize: "1.1em", marginTop: "4px" }}>
                        Итоговая сумма: <strong>{orderReceipt.total.toLocaleString()} ₽</strong>
                    </p>
                </div>
            )}

            {cart.length === 0 ? (
                <p style={{ marginTop: "15px" }}>Ваша корзина пуста.</p>
            ) : (
                <div>
                    <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
                        {cart.map((item) => (
                            <li key={item.name} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "15px" }}
                                />
                                <span style={{ marginRight: "15px" }}>{item.name}: {item.stringPrice} (Кол-во: {item.count})</span>
                                <button onClick={() => decreaseFromCart(item.name)} style={buttonStyles}>-</button>
                                <span style={{ margin: "0 8px" }}>{item.count}</span>
                                <button onClick={() => addToCart(item)} style={buttonStyles}>+</button>
                                <button onClick={() => removeFromCart(item.name)} style={{ ...buttonStyles, marginLeft: "10px" }}>Удалить</button>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "20px" }}>
                        {!appliedCoupon ? (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Введите купон"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    style={{ ...inputStyles, marginRight: "8px" }}
                                />
                                <button onClick={handleApplyCoupon} style={buttonStyles}>Применить</button>
                                {couponError && <p style={{ color: "red", fontSize: "0.85em", marginTop: "5px" }}>{couponError}</p>}
                            </div>
                        ) : (
                            <p>
                                <span>Активен купон {appliedCoupon.code} (-{appliedCoupon.discount}%)</span>
                                <button onClick={removeCoupon} style={{ ...buttonStyles, marginLeft: "8px", padding: "2px 6px" }}>Отмена</button>
                            </p>
                        )}
                    </div>

                    <div style={boxStyle}>
                        <h4>Чек корзины</h4>
                        <p style={{ margin: "6px 0" }}>Изначальная цена: <strong>{subtotalPrice.toLocaleString()} ₽</strong></p>
                        <p style={{ margin: "6px 0" }}>
                            Скидка по купону: {couponDiscountAmount > 0 ? `-${couponDiscountAmount.toLocaleString()} ₽` : "0 ₽"}
                        </p>
                        <p style={{ margin: "8px 0 0 0", fontSize: "1.1em" }}>
                            Итого к оплате: <strong>{totalPrice.toLocaleString()} ₽</strong>
                        </p>
                    </div>

                    <div style={{ ...boxStyle, marginTop: "15px" }}>
                        <h4>Оформление заказа</h4>
                        {!user ? (
                            <div style={{ marginTop: "8px" }}>
                                <p style={{ color: "red", marginBottom: "10px", fontSize: "0.95em" }}>
                                    Чтобы оформить заказ, зарегистрируйтесь или войдите в систему.
                                </p>
                                <Link to="/login" style={{ ...buttonStyles, textDecoration: "none", display: "inline-block" }}>
                                    Войти / Зарегистрироваться
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleCheckout} style={{ marginTop: "10px" }}>
                                {orderError && <p style={{ color: "red", fontSize: "0.85em", marginBottom: "8px" }}>{orderError}</p>}
                                <div style={{ marginBottom: "8px" }}>
                                    <label style={{ display: "block", marginBottom: "3px" }}>Телефон:</label>
                                    <input
                                        type="tel"
                                        placeholder="+7 (999) 000-00-00"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={{ ...inputStyles, width: "100%" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label style={{ display: "block", marginBottom: "3px" }}>Адрес доставки:</label>
                                    <input
                                        type="text"
                                        placeholder="Город, улица, дом, кв"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        style={{ ...inputStyles, width: "100%" }}
                                    />
                                </div>
                                <button type="submit" style={buttonStyles}>Оформить заказ</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}