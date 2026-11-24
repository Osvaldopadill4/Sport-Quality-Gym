package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaInventarioBajo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class VistaInventarioBajoDaoImp implements VistaInventarioBajoDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<VistaInventarioBajo> getInventarioBajo() {
        String query = "FROM VistaInventarioBajo ORDER BY stock ASC";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    @SuppressWarnings("unchecked")
    public List<VistaInventarioBajo> getInventarioBajoPorCategoria(String categoria) {
        String query = "FROM VistaInventarioBajo WHERE categoria = :categoria ORDER BY stock ASC";
        return entityManager.createQuery(query)
                .setParameter("categoria", categoria)
                .getResultList();
    }
}
