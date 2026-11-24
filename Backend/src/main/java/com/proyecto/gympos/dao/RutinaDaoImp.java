package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Rutina;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@Transactional
public class RutinaDaoImp implements RutinaDao{

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Rutina> getRutinas() {
        String query = "FROM Rutina";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Rutina rutina = entityManager.find(Rutina.class, id);
        entityManager.remove(rutina);
    }
    @Override
    public void registrar(Rutina rutina) {
        entityManager.persist(rutina);
    }
    @Override
    public void actualizar(Rutina rutina) {
        entityManager.merge(rutina);
    }
}
