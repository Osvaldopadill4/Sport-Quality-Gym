package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Membresia;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class MembresiaDaoImp implements MembresiaDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Membresia> getMembresias() {
        String query = "FROM Membresia";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Membresia membresia = entityManager.find(Membresia.class, id);
        entityManager.remove(membresia);
    }
    @Override
    public void registrar(Membresia membresia) {
        entityManager.persist(membresia);
    }
    @Override
    public void actualizar(Membresia membresia) {
        entityManager.merge(membresia);
    }
}
