package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Ejercicio;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@Transactional
public class EjercicioDaoImp implements EjercicioDao{

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Ejercicio> getEjercicios() {
        String query = "FROM Ejercicio";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Ejercicio ejercicio = entityManager.find(Ejercicio.class, id);
        entityManager.remove(ejercicio);
    }
    @Override
    public void registrar(Ejercicio ejercicio) {
        entityManager.persist(ejercicio);
    }
    @Override
    public void actualizar(Ejercicio ejercicio) {
        entityManager.merge(ejercicio);
    }
}
