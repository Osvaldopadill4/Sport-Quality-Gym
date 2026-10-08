const API_URL = 'http://localhost:8080/api/plan';

export const getPlanes = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createPlanes = async (data) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const updatePlanes = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const deletePlanes = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
