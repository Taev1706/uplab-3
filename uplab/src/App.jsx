import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { ThemeProvider, ThemeContext } from "./ThemeContext";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext";
import Menu from "./Menu";
import Catalog from "./Catalog";
import Cart from "./Cart";
import Login from "./Login";
import Dashboard from "./Dashboard";

function AppContent() {
  const { appStyles } = useContext(ThemeContext);

  return (
    <div style={appStyles}>
      <BrowserRouter>
        <Menu />
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}