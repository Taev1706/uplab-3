import { createContext, useReducer, useEffect, useState } from "react";

export const CartContext = createContext();

function cartReducer(state, action) {
    switch (action.type) {
        case "ADD": {
            const existingItem = state.find((item) => item.name === action.payload.name);

            if (existingItem) {
                return state.map((item) => {
                    if (item.name === action.payload.name) {
                        return { ...item, count: item.count + 1 };
                    }
                    return item;
                });
            }

            return [...state, { ...action.payload, count: 1 }];
        }

        case "DECREASE": {
            return state
                .map((item) => {
                    if (item.name === action.payload) {
                        return { ...item, count: item.count - 1 };
                    }
                    return item;
                })
                .filter((item) => item.count > 0);
        }

        case "REMOVE": {
            return state.filter((item) => item.name !== action.payload);
        }

        case "CLEAR": {
            return [];
        }

        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, [], () => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        return savedCoupon ? JSON.parse(savedCoupon) : null;
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (appliedCoupon) {
            localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem("appliedCoupon");
        }
    }, [appliedCoupon]);

    function addToCart(product) {
        dispatch({ type: "ADD", payload: product });
    }

    function decreaseFromCart(name) {
        dispatch({ type: "DECREASE", payload: name });
    }

    function removeFromCart(name) {
        dispatch({ type: "REMOVE", payload: name });
    }

    function clearCart() {
        dispatch({ type: "CLEAR" });
        setAppliedCoupon(null);
    }

    function applyCoupon(couponCode, discountPercent) {
        setAppliedCoupon({ code: couponCode, discount: discountPercent });
    }

    function removeCoupon() {
        setAppliedCoupon(null);
    }

    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    const subtotalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);

    const couponDiscountAmount = appliedCoupon
        ? Math.round(subtotalPrice * (appliedCoupon.discount / 100))
        : 0;

    const totalPrice = Math.max(0, subtotalPrice - couponDiscountAmount);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            decreaseFromCart,
            removeFromCart,
            clearCart,
            totalCount,
            subtotalPrice,
            totalPrice,
            appliedCoupon,
            couponDiscountAmount,
            applyCoupon,
            removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
}