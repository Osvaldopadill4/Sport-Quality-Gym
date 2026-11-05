package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaEstadoMembresias;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VistaEstadoMembresiasDaoImp implements VistaEstadoMembresiasDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<VistaEstadoMembresias> getEstadosMembresias() {
        String query = "FROM VistaEstadoMembresias ORDER BY cliente, fecha_vencimiento DESC";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaEstadoMembresias> getMembresiasPorVencer(int dias) {
        String query = "FROM VistaEstadoMembresias WHERE dias_restantes <= :dias AND dias_restantes > 0 ORDER BY dias_restantes ASC";
        return entityManager.createQuery(query)
                .setParameter("dias", dias)
                .getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaEstadoMembresias> getEstadoMembresiaPorCliente(int idCliente) {
        String query = "FROM VistaEstadoMembresias WHERE id_cliente = :idCliente ORDER BY fecha_vencimiento DESC";
        return entityManager.createQuery(query)
                .setParameter("idCliente", idCliente)
                .getResultList();
    }
}
