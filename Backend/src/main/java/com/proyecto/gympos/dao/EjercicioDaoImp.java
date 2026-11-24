package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Ejercicio;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class EjercicioDaoImp implements EjercicioDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Ejercicio> getEjercicios() {
        String query = "FROM Ejercicio WHERE estado = '1' OR estado IS NULL";
        return entityManager.createQuery(query, Ejercicio.class).getResultList();
    }

    @Override
    public List<Ejercicio> getEjerciciosPorRutina(int idRutina) {
        String query = "FROM Ejercicio WHERE id_rutina = :idRutina AND (estado = '1' OR estado IS NULL)";
        return entityManager.createQuery(query, Ejercicio.class)
                .setParameter("idRutina", idRutina)
                .getResultList();
    }

    @Override
    public void eliminarPorRutina(int idRutina) {
        String query = "UPDATE Ejercicio SET estado = '0' WHERE id_rutina = :idRutina";
        entityManager.createQuery(query)
                .setParameter("idRutina", idRutina)
                .executeUpdate();
        entityManager.flush();
    }

    @Override
    public void eliminar(int id) {
        Ejercicio ejercicio = entityManager.find(Ejercicio.class, id);
        if (ejercicio != null) {
            ejercicio.setEstado("0");
            entityManager.merge(ejercicio);
            entityManager.flush();
        }
    }

    @Override
    public void registrar(Ejercicio ejercicio) {
        if (ejercicio.getEstado() == null || ejercicio.getEstado().isEmpty()) {
            ejercicio.setEstado("1");
        }
        entityManager.persist(ejercicio);
        entityManager.flush(); // Garantiza que se inserte en MySQL
    }

    @Override
    public void actualizar(Ejercicio ejercicio) {
        entityManager.merge(ejercicio);
        entityManager.flush();
    }
}
