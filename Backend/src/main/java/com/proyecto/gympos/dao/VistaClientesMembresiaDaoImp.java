package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaClientesMembresia;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VistaClientesMembresiaDaoImp implements VistaClientesMembresiaDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<VistaClientesMembresia> getClientesMembresias() {
        String query = "FROM VistaClientesMembresia ORDER BY cliente";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaClientesMembresia> getClientesMembresiasPorCliente(int idCliente) {
        String query = "FROM VistaClientesMembresia WHERE id_cliente = :idCliente ORDER BY fecha_vencimiento DESC";
        return entityManager.createQuery(query)
                .setParameter("idCliente", idCliente)
                .getResultList();
    }
}
