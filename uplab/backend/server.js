const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
    console.log('Подключение к PostgreSQL успешно установлено');
});

pool.on('error', (err) => {
    console.error('Ошибка в пуле подключений PostgreSQL:', err.message);
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!', timestamp: new Date() });
});

app.get('/api/test-db', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            message: 'Подключение к БД работает!',
            current_time: result.rows[0].current_time
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/services', async (req, res, next) => {
    try {
        const query = `
            SELECT s.*, c.name AS category_name 
            FROM services s
            JOIN categories c ON s.category_id = c.category_id
            ORDER BY s.service_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/categories', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.post('/api/categories', async (req, res, next) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Название категории не может быть пустым' });
    }

    try {
        const check = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [name.trim()]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Категория с таким названием уже существует' });
        }

        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.put('/api/categories/:id', async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Название не может быть пустым' });
    }
    try {
        const check = await pool.query(
            'SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND category_id != $2',
            [name.trim(), id]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Категория с таким названием уже существует' });
        }

        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE category_id = $2 RETURNING *',
            [name.trim(), id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/categories/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE category_id = $1', [id]);
        res.json({ message: 'Категория удалена' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: 'Нельзя удалить категорию, в которой есть товары' });
        }
        next(error);
    }
});

app.post('/api/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
    }

    try {
        const query = `
            SELECT u.user_id, u.email, u.full_name, u.address, u.phone, u.personal_coupon, u.personal_discount, r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.email = $1 AND u.password = $2
        `;
        const result = await pool.query(query, [email.trim(), password.trim()]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.post('/api/register', async (req, res, next) => {
    const { email, password, full_name, address, phone } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
    }

    try {
        const query = `
            INSERT INTO users (role_id, email, password, full_name, address, phone, personal_coupon, personal_discount)
            VALUES (2, $1, $2, $3, $4, $5, NULL, 0)
            RETURNING user_id, email, full_name, address, phone, personal_coupon, personal_discount
        `;
        const result = await pool.query(query, [
            email.trim(),
            password.trim(),
            full_name.trim(),
            address ? address.trim() : '',
            phone ? phone.trim() : ''
        ]);
        const newUser = result.rows[0];
        newUser.role = 'user';
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        next(error);
    }
});

app.put('/api/users/:id', async (req, res, next) => {
    const { id } = req.params;
    const { full_name, email, password, address, phone } = req.body;

    if (!full_name || !email) {
        return res.status(400).json({ error: 'Имя и email обязательны' });
    }

    try {
        let query, params;
        if (password && password.trim()) {
            query = `
                UPDATE users 
                SET full_name = $1, email = $2, password = $3, address = $4, phone = $5
                WHERE user_id = $6 
                RETURNING user_id, email, full_name, address, phone, personal_coupon, personal_discount
            `;
            params = [
                full_name.trim(),
                email.trim(),
                password.trim(),
                address ? address.trim() : '',
                phone ? phone.trim() : '',
                id
            ];
        } else {
            query = `
                UPDATE users 
                SET full_name = $1, email = $2, address = $3, phone = $4
                WHERE user_id = $5 
                RETURNING user_id, email, full_name, address, phone, personal_coupon, personal_discount
            `;
            params = [
                full_name.trim(),
                email.trim(),
                address ? address.trim() : '',
                phone ? phone.trim() : '',
                id
            ];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Этот email уже используется' });
        }
        next(error);
    }
});

app.patch('/api/services/:id/discount', async (req, res, next) => {
    const { id } = req.params;
    const { discount_percent } = req.body;

    const discount = Number(discount_percent);
    if (isNaN(discount) || discount < 0 || discount > 99) {
        return res.status(400).json({ error: 'Скидка должна быть от 0 до 99%' });
    }

    try {
        const result = await pool.query(
            'UPDATE services SET discount_percent = $1 WHERE service_id = $2 RETURNING *',
            [discount, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар или услуга не найдены' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.get('/api/coupons', async (req, res, next) => {
    try {
        const query = `
            SELECT c.*, u.full_name AS user_name, u.email AS user_email 
            FROM coupons c
            LEFT JOIN users u ON c.user_id = u.user_id
            ORDER BY c.coupon_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.post('/api/coupons', async (req, res, next) => {
    const { code, discount_percent, user_id } = req.body;
    const discount = Number(discount_percent);

    if (!code || !code.trim()) {
        return res.status(400).json({ error: 'Укажите код купона' });
    }
    if (isNaN(discount) || discount < 1 || discount > 99) {
        return res.status(400).json({ error: 'Скидка по купону должна быть от 1% до 99%' });
    }

    try {
        const targetUserId = user_id ? Number(user_id) : null;
        const result = await pool.query(
            'INSERT INTO coupons (code, discount_percent, user_id) VALUES ($1, $2, $3) RETURNING *',
            [code.trim().toUpperCase(), discount, targetUserId]
        );

        if (targetUserId) {
            await pool.query(
                'UPDATE users SET personal_coupon = $1, personal_discount = $2 WHERE user_id = $3',
                [code.trim().toUpperCase(), discount, targetUserId]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Купон с таким кодом уже существует' });
        }
        next(error);
    }
});

app.delete('/api/coupons/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM coupons WHERE coupon_id = $1', [id]);
        res.json({ message: 'Купон удален' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/users', async (req, res, next) => {
    try {
        const query = `
            SELECT u.user_id, u.email, u.full_name, u.address, u.phone, u.personal_coupon, u.personal_discount, r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.post('/api/orders', async (req, res, next) => {
    const { user_id, phone, address, subtotal_amount, discount_amount, total_amount, items } = req.body;

    if (!phone || !phone.trim() || !address || !address.trim()) {
        return res.status(400).json({ error: 'Укажите телефон и адрес доставки' });
    }

    try {
        const itemsSummary = (items || []).map(i => `${i.name} (x${i.count})`).join(', ');
        const result = await pool.query(
            `INSERT INTO orders (user_id, phone, address, subtotal_amount, discount_amount, total_amount, items_summary)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id || 2, phone.trim(), address.trim(), subtotal_amount, discount_amount || 0, total_amount, itemsSummary]
        );

        await pool.query(
            `INSERT INTO payments (user_id, amount, payment_method, status)
             VALUES ($1, $2, 'Оплата при получении', 'completed')`,
            [user_id || 2, total_amount]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.get('/api/orders', async (req, res, next) => {
    const { user_id, is_admin } = req.query;

    try {
        let query, params;
        if (is_admin === 'true') {
            query = `
                SELECT o.*, u.full_name, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.user_id 
                ORDER BY o.order_id DESC
            `;
            params = [];
        } else {
            query = `
                SELECT o.*, u.full_name, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.user_id 
                WHERE o.user_id = $1 
                ORDER BY o.order_id DESC
            `;
            params = [user_id];
        }
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/orders/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM orders WHERE order_id = $1', [id]);
        res.json({ message: 'Заказ успешно удален' });
    } catch (error) {
        next(error);
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Запрашиваемый ресурс не найден' });
});

app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера. Повторите попытку позже.' });
});

process.on('unhandledRejection', (reason) => {
    console.error('Необработанный отказ промиса:', reason);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});