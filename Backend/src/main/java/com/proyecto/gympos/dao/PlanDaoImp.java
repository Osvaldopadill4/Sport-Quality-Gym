package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Plan;
import com.proyecto.gympos.modelos.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@Transactional
public class PlanDaoImp implements PlanDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Plan> getPlanes() {
        String query = "FROM Plan";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Plan plan = entityManager.find(Plan.class, id);
        entityManager.remove(plan);
    }
    @Override
    public void registrar(Plan plan) {
        entityManager.persist(plan);
    }
    @Override
    public void actualizar(Plan plan) {
        entityManager.merge(plan);
    }
}
