import { useContext } from "react";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";

export default function Cart() {
    const { cart, addToCart, decreaseFromCart, removeFromCart, totalPrice } = useContext(CartContext);
    const { buttonStyles } = useContext(ThemeContext);

    return (
        <div>
            <h2>Корзина</h2>

            {cart.length === 0 ? (
                <p>Ваша корзина пуста.</p>
            ) : (
                <div>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {cart.map((item) => (
                            <li key={item.name} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", marginRight: "15px" }}
                                />
                                <span>{item.name}: {item.stringPrice} (Кол-во: {item.count})</span>
                                <button onClick={() => addToCart(item)} style={{ ...buttonStyles, marginLeft: "15px" }}>+</button>
                                <button onClick={() => decreaseFromCart(item.name)} style={{ ...buttonStyles, marginLeft: "5px" }}>-</button>
                                <button onClick={() => removeFromCart(item.name)} style={{ ...buttonStyles, marginLeft: "10px" }}>Удалить</button>
                            </li>
                        ))}
                    </ul>

                    <h3 style={{ marginTop: "20px" }}>
                        Итоговая сумма: {totalPrice.toLocaleString()} ₽
                    </h3>
                </div>
            )}
        </div>
    );
}