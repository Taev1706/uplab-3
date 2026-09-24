import { createContext, useReducer, useEffect } from "react";

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

        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, [], () => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    function addToCart(product) {
        dispatch({ type: "ADD", payload: product });
    }

    function decreaseFromCart(name) {
        dispatch({ type: "DECREASE", payload: name });
    }

    function removeFromCart(name) {
        dispatch({ type: "REMOVE", payload: name });
    }

    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, decreaseFromCart, removeFromCart, totalCount, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}