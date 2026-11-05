package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaHistorialAccesos;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VistaHistorialAccesosDaoImp implements VistaHistorialAccesosDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<VistaHistorialAccesos> getHistorialAccesos() {
        String query = "FROM VistaHistorialAccesos ORDER BY fecha DESC, hora DESC";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaHistorialAccesos> getHistorialAccesosPorCliente(int idCliente) {
        String query = "FROM VistaHistorialAccesos WHERE id_cliente = :idCliente ORDER BY fecha DESC, hora DESC";
        return entityManager.createQuery(query)
                .setParameter("idCliente", idCliente)
                .getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaHistorialAccesos> getHistorialAccesosPorFecha(String fecha) {
        String query = "FROM VistaHistorialAccesos WHERE fecha = :fecha ORDER BY hora DESC";
        return entityManager.createQuery(query)
                .setParameter("fecha", fecha)
                .getResultList();
    }
}
