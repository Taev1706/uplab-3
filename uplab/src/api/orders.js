const API_URL = 'http://localhost:3001/api/orders';

export async function createOrder(orderData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при оформлении заказа');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Не удалось оформить заказ.');
        }
        throw err;
    }
}

export async function getOrders(userId, isAdmin) {
    try {
        const url = `${API_URL}?user_id=${userId}&is_admin=${isAdmin ? 'true' : 'false'}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при получении списка заказов');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Список заказов не загружен.');
        }
        throw err;
    }
}

export async function deleteOrder(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при удалении заказа');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Чек не удален.');
        }
        throw err;
    }
}