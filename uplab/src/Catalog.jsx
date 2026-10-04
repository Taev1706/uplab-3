import { useState, useEffect, useContext } from "react";
import ProductCard from "./ProductCard";
import { getServices } from "./api/services";
import { getCategories } from "./api/categories";
import { ThemeContext } from "./ThemeContext";

export default function Catalog() {
    const { buttonStyles, inputStyles } = useContext(ThemeContext);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [servicesData, categoriesData] = await Promise.all([
                getServices(),
                getCategories()
            ]);
            setServices(servicesData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message || "Ошибка загрузки каталога");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCategoryToggle = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleResetAll = () => {
        setSelectedCategories([]);
        setSearchQuery("");
    };

    const filteredServices = services.filter((item) => {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_id);
        const text = (item.name + " " + (item.description || "")).toLowerCase();
        const matchesSearch = text.includes(searchQuery.toLowerCase().trim());
        return matchesCategory && matchesSearch;
    });

    if (loading) return <p>Загрузка каталога...</p>;

    if (error) {
        return (
            <div style={{
                padding: "16px",
                border: "1px solid #d32f2f",
                borderRadius: "4px",
                maxWidth: "480px",
                marginTop: "20px"
            }}>
                <h3 style={{ color: "#d32f2f", marginBottom: "8px" }}>Ошибка связи с сервером</h3>
                <p style={{ marginBottom: "12px" }}>{error}</p>
                <button onClick={loadData} style={buttonStyles}>Повторить попытку</button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: "20px" }}>
                <h1>Каталог товаров и услуг</h1>
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ ...inputStyles, width: "220px", marginTop: "10px" }}
                />
            </div>

            <div style={{ display: "flex", alignItems: "flex-start" }}>
                <aside style={{ width: "180px", marginRight: "30px" }}>
                    <h3>Категории</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                        {categories.map((cat) => (
                            <label key={cat.category_id} style={{ cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.category_id)}
                                    onChange={() => handleCategoryToggle(cat.category_id)}
                                    style={{ marginRight: "8px" }}
                                />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                    {(selectedCategories.length > 0 || searchQuery) && (
                        <button
                            onClick={handleResetAll}
                            style={{ ...buttonStyles, marginTop: "12px", padding: "4px 8px" }}
                        >
                            Сбросить
                        </button>
                    )}
                </aside>

                <main style={{ flex: 1 }}>
                    {filteredServices.length === 0 ? (
                        <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "4px", maxWidth: "400px" }}>
                            <p style={{ marginBottom: "10px" }}>Ничего не найдено по вашему запросу.</p>
                            <button onClick={handleResetAll} style={buttonStyles}>
                                Сбросить поиск и фильтры
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 220px)", gap: "15px" }}>
                            {filteredServices.map((item) => (
                                <ProductCard key={item.service_id} item={item} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}