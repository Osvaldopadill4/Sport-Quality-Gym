package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Acceso;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
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
    public String registrarConProcedure(int idCliente) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_registrar_acceso");
        query.registerStoredProcedureParameter("p_id_cliente", Integer.class, ParameterMode.IN);
        query.setParameter("p_id_cliente", idCliente);

        query.execute();

        return (String) query.getSingleResult();
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
