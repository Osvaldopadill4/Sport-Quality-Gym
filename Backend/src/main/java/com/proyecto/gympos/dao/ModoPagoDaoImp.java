package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.ModoPago;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class ModoPagoDaoImp implements ModoPagoDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<ModoPago> getModosPago() {
        String query = "FROM ModoPago";
        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public ModoPago getModoPagoPorId(int id) {
        return entityManager.find(ModoPago.class, id);
    }
}
