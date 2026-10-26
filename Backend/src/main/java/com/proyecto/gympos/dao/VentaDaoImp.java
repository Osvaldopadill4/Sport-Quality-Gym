package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Venta;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VentaDaoImp implements VentaDao{

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Venta> getVentas() {
        String query = "FROM Venta";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Venta venta = entityManager.find(Venta.class, id);
        entityManager.remove(venta);
    }
    @Override
    public void registrar(Venta venta) {
        entityManager.persist(venta);
    }
    @Override
    public void actualizar(Venta venta) {
        entityManager.merge(venta);
    }
}
