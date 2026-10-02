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
        entityManager.persist(usuario);
    }

    @Override
    public void actualizar(Usuario usuario) {
        entityManager.merge(usuario);
    }

    @Override
    public boolean verificarCredenciales(Usuario usuario) {
        String query = "FROM Usuario WHERE correo = :correo AND contrasena = :contrasena";
        System.out.println("Ejecutando query: " + query);
        System.out.println("Parámetro - correo: " + usuario.getCorreo());

        List<Usuario> lista = entityManager.createQuery(query)
                .setParameter("correo", usuario.getCorreo())
                .setParameter("contrasena", usuario.getContrasena())
                .getResultList();

        System.out.println("Resultados encontrados: " + lista.size());

        if (!lista.isEmpty()) {
            System.out.println("Usuario encontrado: " + lista.get(0).getNombre());
            return true;
        }
        System.out.println("No se encontró usuario con esas credenciales");
        return false;
    }
}
