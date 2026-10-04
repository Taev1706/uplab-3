const API_URL = 'http://localhost:3001/api/services';

export async function getServices() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при получении каталога');
        }
        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.');
        }
        throw err;
    }
}

export async function updateServiceDiscount(id, discountPercent) {
    try {
        const response = await fetch(`${API_URL}/${id}/discount`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ discount_percent: discountPercent }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при обновлении скидки');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Проверьте подключение.');
        }
        throw err;
    }
}