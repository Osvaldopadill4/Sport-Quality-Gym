package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Cliente;

import java.util.List;

public interface ClienteDao {
    List<Cliente> getClientes();

    Cliente getClientePorId(int id);

    void eliminar(int id);

    void registrar(Cliente cliente);

    void actualizar(Cliente cliente);
}
