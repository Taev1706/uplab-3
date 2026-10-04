const API_URL = 'http://localhost:3001/api';

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при авторизации');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Пожалуйста, запустите бэкенд.');
        }
        throw err;
    }
}

export async function registerUser(email, password, fullName, address, phone) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, full_name: fullName, address, phone }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при регистрации');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Не удалось зарегистрироваться.');
        }
        throw err;
    }
}

export async function updateUserProfile(userId, fullName, email, password, address, phone) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ full_name: fullName, email, password, address, phone }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при обновлении профиля');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Профиль не сохранен.');
        }
        throw err;
    }
}

export async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при получении списка пользователей');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Список пользователей не загружен.');
        }
        throw err;
    }
}