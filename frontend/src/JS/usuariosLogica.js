// Lógica y funciones API para el módulo de Usuarios

const API_URL = 'http://localhost:8080/api/usuario';

/**
 * Obtiene todos los usuarios del sistema
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(API_URL);
    const datos = await respuesta.json();

    if (Array.isArray(datos)) {
      return datos.map(usuario => ({
        ...usuario,
        rol: mapearNumeroARol(usuario.id_rol)
      }));
    } else {
      console.error("El servidor respondió con algo que no es una lista:", datos);
      return [];
    }
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return [];
  }
}

function mapearNumeroARol(idRol) {
  const rolMap = {
    1: 'ADMIN',
    2: 'RECEPCIONISTA',
    3: 'ENTRENADOR'
  };
  return rolMap[idRol] || '';
}

/**
 * Crea un nuevo usuario
 * @param {Object} usuario - Datos del usuario a crear
 * @returns {Promise<Object>} Usuario creado
 */
export async function crearUsuario(usuario) {
  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_rol: mapearRolANumero(usuario.rol),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        correo: usuario.correo,
        contrasena: usuario.password,
        estado: usuario.estado
      })
    });

    if (!respuesta.ok) {
      throw new Error('Error al crear usuario');
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
}

function mapearRolANumero(rol) {
  const rolMap = {
    'ADMIN': 1,
    'RECEPCIONISTA': 2,
    'ENTRENADOR': 3
  };
  return rolMap[rol] || 0;
}

/**
 * Actualiza un usuario existente
 * @param {number} id - ID del usuario a actualizar
 * @param {Object} usuario - Datos actualizados del usuario
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function actualizarUsuario(id, usuario) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_rol: mapearRolANumero(usuario.rol),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        correo: usuario.correo,
        estado: usuario.estado
      })
    });

    if (!respuesta.ok) {
      throw new Error('Error al actualizar usuario');
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
}

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export async function eliminarUsuarioAPI(id) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!respuesta.ok) {
      throw new Error('Error al eliminar usuario');
    }
    
    return true;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
}

/**
 * Obtiene un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 */
export async function obtenerUsuarioPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`);
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    throw error;
  }
}
