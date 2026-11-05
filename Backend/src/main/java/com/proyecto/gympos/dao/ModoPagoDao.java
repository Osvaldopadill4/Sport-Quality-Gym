package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.ModoPago;

import java.util.List;

public interface ModoPagoDao {
    List<ModoPago> getModosPago();
    ModoPago getModoPagoPorId(int id);
}
