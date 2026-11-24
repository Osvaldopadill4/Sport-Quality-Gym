package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Compra;

import java.util.List;

public interface CompraDao {
    List<Compra> getCompras();

    void eliminar(int id);

    void registrar(Compra compra);

    void actualizar(Compra compra);
}
