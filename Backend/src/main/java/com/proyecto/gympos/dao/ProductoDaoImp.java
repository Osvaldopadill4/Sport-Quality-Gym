package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@Transactional
public class ProductoDaoImp implements ProductoDao{
    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Producto> getProductos() {
        String query = "FROM Producto";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Producto producto = entityManager.find(Producto.class, id);
        if (producto != null) {
            producto.setEstado("0");
            entityManager.merge(producto);
        }
    }
    @Override
    public void registrar(Producto producto) {
        entityManager.persist(producto);
    }
    @Override
    public void actualizar(Producto producto) {
        entityManager.merge(producto);
    }
}
