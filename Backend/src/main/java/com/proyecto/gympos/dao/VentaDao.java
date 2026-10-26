package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Venta;

import java.util.List;

public interface VentaDao {
    List<Venta> getVentas();

    void eliminar(int id);

    void registrar(Venta venta);

    void actualizar(Venta venta);
}
