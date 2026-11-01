package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Detalle_compra;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class Detalle_CompraDaoImp implements Detalle_CompraDao{

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Detalle_compra> getDetalle_compras() {
        String query = "FROM Detalle_compra";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Detalle_compra detalleCompra = entityManager.find(Detalle_compra.class, id);
        entityManager.remove(detalleCompra);
    }
    @Override
    public void registrar(Detalle_compra detalleCompra) {
        entityManager.persist(detalleCompra);
    }
    @Override
    public void actualizar(Detalle_compra detalleCompra) {
        entityManager.merge(detalleCompra);
    }
}
