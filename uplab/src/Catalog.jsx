import ProductCard from "./ProductCard";

export default function Catalog() {
    return (
        <div>
            <h1>Каталог товаров</h1>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
                <ProductCard name="iPhone 15 Pro" price="95 000" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQDxu6z0DR6HdwrQjlejJghWhrOvurVd6mtF6j62mKgA&s=10" />
                <ProductCard name="Наушники AirPods 4" price="17 000" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMiWHGT8c5aND6tgnFOygZQUM97DTxUY0MYKmp72gWWQ&s" />
                <ProductCard name="Видеокарта RTX 5070" price="75 000" image="https://ir.ozone.ru/s3/multimedia-1-d/w500/9078278521.jpg" />
                <ProductCard name="Процессор AMD Ryzen 7 7700" price="24 000" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv0ttvmhYurtk1nQZZsYvWPIjb975WdQTHjYsFpxw8BQ&s=10" />
                <ProductCard name="Игра Ведьмак 3" price="1 500" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLCoJfsMfW_e-nl5PCrWdyCeTpCZT821fWx0RAtxvJ4g&s=10" />
            </div>
        </div>
    );
}