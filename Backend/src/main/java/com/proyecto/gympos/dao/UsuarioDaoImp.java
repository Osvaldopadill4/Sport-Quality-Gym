package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public class UsuarioDaoImp implements UsuarioDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Usuario> getUsuarios() {
        String query = "FROM Usuario";
        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public void eliminar(int id) {
        Usuario usuario = entityManager.find(Usuario.class, id);
        entityManager.remove(usuario);
    }

    @Override
    public void registrar(Usuario usuario) {
        entityManager.merge(usuario);
    }

    @Override
    public Usuario verificarCredenciales(String correo, String contrasena) {
        // Hacemos una consulta a la BD buscando exactamente ese correo y contraseña
        String query = "FROM Usuario WHERE correo = :correo AND contrasena = :contrasena";
        
        // Guardamos los resultados en una lista
        List<Usuario> lista = entityManager.createQuery(query, Usuario.class)
                .setParameter("correo", correo)
                .setParameter("contrasena", contrasena)
                .getResultList();

        // Si la lista está vacía, significa que las credenciales son incorrectas
        if (lista.isEmpty()) {
            return null; // Retornamos nulo (login fallido)
        }
        
        // Si sí se encontró, regresamos al usuario completo
        return lista.get(0);
    }
}
