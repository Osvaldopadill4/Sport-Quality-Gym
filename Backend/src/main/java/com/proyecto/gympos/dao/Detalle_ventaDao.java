package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Detalle_venta;
import com.proyecto.gympos.modelos.Venta;

import java.util.List;

public interface Detalle_ventaDao {
    List<Detalle_venta> getDetalle_ventas();

    void eliminar(int id);

    void registrar(Detalle_venta detalleVenta);

    void actualizar(Detalle_venta detalleVenta);
}
