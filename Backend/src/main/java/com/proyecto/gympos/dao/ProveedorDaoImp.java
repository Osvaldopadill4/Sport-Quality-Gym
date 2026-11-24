package com.proyecto.gympos.dao;
import com.proyecto.gympos.modelos.Proveedor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@Transactional
public class ProveedorDaoImp implements ProveedorDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Proveedor> getProveedores() {
        String query = "FROM Proveedor";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Proveedor proveedor = entityManager.find(Proveedor.class, id);
        if (proveedor != null) {
            proveedor.setEstado("0");
            entityManager.merge(proveedor);
        }
    }
    @Override
    public void registrar(Proveedor proveedor) {
        entityManager.persist(proveedor);
    }
    @Override
    public void actualizar(Proveedor proveedor) {
        entityManager.merge(proveedor);
    }
}
