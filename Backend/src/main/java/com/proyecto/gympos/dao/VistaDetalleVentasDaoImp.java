package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaDetalleVentas;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VistaDetalleVentasDaoImp implements VistaDetalleVentasDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<VistaDetalleVentas> getDetalleVentas() {
        String query = "FROM VistaDetalleVentas ORDER BY fecha DESC";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaDetalleVentas> getDetalleVentasPorCliente(int idCliente) {
        String query = "FROM VistaDetalleVentas WHERE cliente LIKE CONCAT('%', (SELECT nombre FROM cliente WHERE id = :idCliente), '%') ORDER BY fecha DESC";
        return entityManager.createQuery(query)
                .setParameter("idCliente", idCliente)
                .getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaDetalleVentas> getDetalleVentasPorFecha(String fechaInicio, String fechaFin) {
        String query = "FROM VistaDetalleVentas WHERE fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY fecha DESC";
        return entityManager.createQuery(query)
                .setParameter("fechaInicio", fechaInicio)
                .setParameter("fechaFin", fechaFin)
                .getResultList();
    }
}
