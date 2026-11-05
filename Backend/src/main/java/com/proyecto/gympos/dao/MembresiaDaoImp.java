package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Membresia;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class MembresiaDaoImp implements MembresiaDao {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Membresia> getMembresias() {
        String query = "FROM Membresia";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Membresia membresia = entityManager.find(Membresia.class, id);
        entityManager.remove(membresia);
    }
    @Override
    public void registrar(Membresia membresia) {
        entityManager.persist(membresia);
    }
    @Override
    public void actualizar(Membresia membresia) {
        entityManager.merge(membresia);
    }

    @Override
    public int getDiasRestantes(int idMembresia) {
        String query = "SELECT fn_dias_restantes_membresia(m.fecha_vencimiento) " +
                      "FROM membresia m WHERE m.id = :id";

        try {
            Integer dias = (Integer) entityManager.createNativeQuery(query)
                    .setParameter("id", idMembresia)
                    .getSingleResult();
            return dias != null ? dias : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public String getEstadoMembresia(int idMembresia) {
        String query = "SELECT fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento) " +
                      "FROM membresia m WHERE m.id = :id";

        try {
            return (String) entityManager.createNativeQuery(query)
                    .setParameter("id", idMembresia)
                    .getSingleResult();
        } catch (Exception e) {
            return "Desconocido";
        }
    }
}
