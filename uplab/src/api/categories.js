const API_URL = 'http://localhost:3001/api/categories';

export async function getCategories() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при получении категорий');
        }
        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Не удалось подключиться к серверу.');
        }
        throw err;
    }
}

export async function createCategory(name) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при добавлении категории');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Категория не сохранена.');
        }
        throw err;
    }
}

export async function updateCategory(id, name) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при обновлении категории');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Категория не обновлена.');
        }
        throw err;
    }
}

export async function deleteCategory(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при удалении категории');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Удаление невозможно.');
        }
        throw err;
    }
}