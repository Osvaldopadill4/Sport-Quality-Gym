package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Producto;
import com.proyecto.gympos.modelos.Proveedor;

import java.util.List;

public interface ProductoDao {
    List<Producto> getProductos();

    void eliminar(int id);

    void registrar(Producto producto);

    void actualizar(Producto producto);
}
