package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Compra;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class CompraDaoImp implements CompraDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Compra> getCompras() {
        String query = "FROM compra";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Compra compra = entityManager.find(Compra.class, id);
        entityManager.remove(compra);
    }
    @Override
    public void registrar(Compra compra) {
        entityManager.persist(compra);
    }
    @Override
    public void actualizar(Compra compra) {
        entityManager.merge(compra);
    }
}