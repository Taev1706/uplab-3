const API_URL = 'http://localhost:3001/api/coupons';

export async function getCoupons() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при получении купонов');
        }
        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен.');
        }
        throw err;
    }
}

export async function createCoupon(couponData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при создании купона');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен. Купон не создан.');
        }
        throw err;
    }
}

export async function deleteCoupon(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Ошибка при удалении купона');
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('fetch')) {
            throw new Error('Сервер недоступен.');
        }
        throw err;
    }
}