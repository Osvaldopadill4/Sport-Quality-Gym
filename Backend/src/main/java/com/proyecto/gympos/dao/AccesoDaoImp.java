package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Acceso;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class AccesoDaoImp implements AccesoDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public void registrar(Acceso acceso) {
        entityManager.persist(acceso);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Acceso> getAccesosPorCliente(int clienteId) {
        String query = "FROM Acceso WHERE id_cliente = :clienteId ORDER BY fecha DESC, hora DESC";
        return entityManager.createQuery(query)
                .setParameter("clienteId", clienteId)
                .getResultList();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Acceso> getAccesos() {
        String query = "FROM Acceso ORDER BY fecha DESC, hora DESC";
        return entityManager.createQuery(query).getResultList();
    }
}
