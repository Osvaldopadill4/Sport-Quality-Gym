package com.proyecto.gympos.dao;
import com.proyecto.gympos.modelos.Corte_caja;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
@Transactional
public class CorteCajaDaoImp implements CorteCajaDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Corte_caja> getCorteCajas() {
        String query = "FROM Corte_caja";
        return entityManager.createQuery(query).getResultList();
    }
    @Override
    public void eliminar(int id) {
        Corte_caja corteCaja = entityManager.find(Corte_caja.class, id);
        entityManager.remove(corteCaja);
    }
    @Override
    public void registrar(Corte_caja corteCaja) {
        entityManager.persist(corteCaja);
    }
    @Override
    public void actualizar(Corte_caja corteCaja) {
        entityManager.merge(corteCaja);
    }
}
