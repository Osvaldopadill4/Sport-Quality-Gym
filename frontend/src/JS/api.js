export const API_BASE_URL = 'http://localhost:8080/api'; // URL de Spring Boot

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error('Error en la autenticación');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loginUser:', error);
        throw error;
    }
};

export const getDashboardData = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos del dashboard');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getDashboardData:', error);
        throw error;
    }
};
