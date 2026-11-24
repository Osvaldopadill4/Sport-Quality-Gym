package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Cliente;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class ClienteDaoImp implements ClienteDao {
    @PersistenceContext
    EntityManager entityManager;

    @Override
    public List<Cliente> getClientes() {
        String query = "FROM Cliente";
        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public Cliente getClientePorId(int id) {
        return entityManager.find(Cliente.class, id);
    }

    @Override
    public void eliminar(int id) {
        Cliente cliente = entityManager.find(Cliente.class, id);
        entityManager.remove(cliente);
    }

    @Override
    public void registrar(Cliente cliente) {
        entityManager.persist(cliente);
    }

    @Override
    public void actualizar(Cliente cliente) {
        entityManager.merge(cliente);
    }

    @Override
    public boolean verificarCredencialesCliente(Cliente cliente) {
        String query = "FROM Cliente WHERE telefono = :telefono AND contrasena = :contrasena";
        System.out.println("Ejecutando query: " + query);
        System.out.println("Parámetro - correo: " + cliente.getTelefono());

        List<Cliente> lista = entityManager.createQuery(query)
                .setParameter("telefono", cliente.getTelefono())
                .setParameter("contrasena", cliente.getContrasena())
                .getResultList();

        System.out.println("Resultados encontrados: " + lista.size());

        if (!lista.isEmpty()) {
            System.out.println("Cliente encontrado: " + lista.get(0).getNombre());
            return true;
        }
        System.out.println("No se encontró cliente con esas credenciales");
        return false;
    }
}
