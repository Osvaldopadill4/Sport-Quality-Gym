package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Detalle_venta;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class Detalle_ventaDaoImp implements Detalle_ventaDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Detalle_venta> getDetalle_ventas() {
        String query = "FROM detalle_venta";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Detalle_venta detalleVenta = entityManager.find(Detalle_venta.class, id);
        entityManager.remove(detalleVenta);
    }
    @Override
    public void registrar(Detalle_venta detalleVenta) {
        entityManager.persist(detalleVenta);
    }
    @Override
    public void actualizar(Detalle_venta detalleVenta) {
        entityManager.merge(detalleVenta);
    }
}
