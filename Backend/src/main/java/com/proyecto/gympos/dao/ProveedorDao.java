package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Proveedor;

import java.util.List;

public interface ProveedorDao {
    List<Proveedor> getProveedores();

    void eliminar(int id);

    void registrar(Proveedor proveedor);

    void actualizar(Proveedor proveedor);
}
