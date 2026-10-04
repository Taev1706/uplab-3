import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";
import { AuthContext } from "./AuthContext";

export default function ProductCard({ item }) {
    const { addToCart } = useContext(CartContext);
    const { theme, buttonStyles } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const originalPrice = Number(item.price);
    const discount = item.discount_percent || 0;
    const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
    const displayPrice = `${finalPrice.toLocaleString()} ₽`;
    const imageUrl = item.image_url || item.image || item.img;

    const handleBuy = () => {
        if (user?.role === "admin") return;
        addToCart({
            id: item.service_id,
            name: item.name,
            price: finalPrice,
            stringPrice: displayPrice,
            image: imageUrl,
            isService: item.is_service
        });
        navigate("/cart");
    };

    return (
        <div style={{
            width: "220px",
            padding: "10px",
            border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
            borderRadius: "4px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <div>
                <img
                    src={imageUrl}
                    alt={item.name}
                    style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "2px" }}
                />
                <h4 style={{ margin: "8px 0 4px 0" }}>{item.name}</h4>
                {item.duration && <p style={{ fontSize: "0.85em" }}>Длительность: {item.duration}</p>}
                {item.description && <p style={{ fontSize: "0.8em", margin: "4px 0" }}>{item.description}</p>}
            </div>

            <div>
                <p style={{ margin: "6px 0" }}>
                    {discount > 0 ? (
                        <>
                            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "6px", fontSize: "0.85em" }}>
                                {originalPrice.toLocaleString()} ₽
                            </span>
                            <strong style={{ color: "red" }}>{displayPrice} (-{discount}%)</strong>
                        </>
                    ) : (
                        <strong>{displayPrice}</strong>
                    )}
                </p>
                {user?.role !== "admin" && (
                    <button onClick={handleBuy} style={{ ...buttonStyles, width: "100%", padding: "5px 8px" }}>
                        {item.is_service ? "Записаться" : "В корзину"}
                    </button>
                )}
            </div>
        </div>
    );
}