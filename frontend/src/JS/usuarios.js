const API_URL = 'http://localhost:8080/api/usuario';

export const getUsuarios = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener usuarios');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createUsuario = async (usuario) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });
    return await res.json();
};

export const updateUsuario = async (id, usuario) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });
    return await res.json();
};

export const deleteUsuario = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
