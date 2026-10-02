const API_URL = 'http://localhost:8080/api/cliente';

export const getClientes = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener clientes');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createCliente = async (cliente) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });
    return await res.json();
};

export const updateCliente = async (id, cliente) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });
    return await res.json();
};

export const deleteCliente = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
