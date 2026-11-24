package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Rutina;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class RutinaDaoImp implements RutinaDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Rutina> getRutinas() {
        String query = "FROM Rutina WHERE estado = '1' OR estado IS NULL";
        return entityManager.createQuery(query, Rutina.class).getResultList();
    }

    @Override
    public List<Rutina> getRutinasPorCliente(int idCliente) {
        String query = "FROM Rutina WHERE id_cliente = :idCliente AND (estado = '1' OR estado IS NULL)";
        return entityManager.createQuery(query, Rutina.class)
                .setParameter("idCliente", idCliente)
                .getResultList();
    }

    @Override
    public Rutina getRutinaPorId(int id) {
        return entityManager.find(Rutina.class, id);
    }

    @Override
    public int contarRutinasActivasPorCliente(int idCliente) {
        String query = "SELECT COUNT(r) FROM Rutina r WHERE r.id_cliente = :idCliente AND (r.estado = '1' OR r.estado IS NULL)";
        Object result = entityManager.createQuery(query)
                .setParameter("idCliente", idCliente)
                .getSingleResult();
        return result instanceof Number ? ((Number) result).intValue() : 0;
    }

    @Override
    public void eliminar(int id) {
        Rutina rutina = entityManager.find(Rutina.class, id);
        if (rutina != null) {
            rutina.setEstado("0");
            entityManager.merge(rutina);
            entityManager.flush();
        }
    }

    @Override
    public void registrar(Rutina rutina) {
        if (rutina.getEstado() == null || rutina.getEstado().isEmpty()) {
            rutina.setEstado("1");
        }
        entityManager.persist(rutina);
        entityManager.flush(); // Garantiza que se ejecute el INSERT en MySQL y genere rutina.id
    }

    @Override
    public void actualizar(Rutina rutina) {
        entityManager.merge(rutina);
        entityManager.flush();
    }
}
