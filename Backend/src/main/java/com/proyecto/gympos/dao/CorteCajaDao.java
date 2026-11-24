package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Corte_caja;

import java.util.List;

public interface CorteCajaDao {
    List<Corte_caja> getCorteCajas();

    void eliminar(int id);

    void registrar(Corte_caja corteCaja);

    void actualizar(Corte_caja corteCaja);
}
