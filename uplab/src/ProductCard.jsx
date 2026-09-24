import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";

export default function ProductCard({ name, price, image, img }) {
    const { addToCart } = useContext(CartContext);
    const { buttonStyles } = useContext(ThemeContext);
    const navigate = useNavigate();

    const numericPrice = Number(String(price).replace(/[^\d]/g, ""));
    const displayPrice = String(price).includes("₽") ? price : `${price} ₽`;
    const imageUrl = img || image;

    const handleBuy = () => {
        addToCart({ name, price: numericPrice, stringPrice: displayPrice, image: imageUrl });
        navigate("/cart");
    };

    return (
        <div style={{ marginBottom: "30px", marginRight: "20px" }}>
            <img src={imageUrl} alt={name} style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
            <h3>{name}</h3>
            <p>{displayPrice}</p>
            <button onClick={handleBuy} style={buttonStyles}>В корзину</button>
        </div>
    );
}