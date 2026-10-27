package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Detalle_compra;
import com.proyecto.gympos.modelos.Detalle_venta;

import java.util.List;

public interface Detalle_CompraDao {
    List<Detalle_compra> getDetalle_compras();

    void eliminar(int id);

    void registrar(Detalle_compra detalleCompra);

    void actualizar(Detalle_compra detalleCompra);
}
