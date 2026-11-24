package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Membresia;

import java.util.List;

public interface MembresiaDao {
    List<Membresia> getMembresias();

    void eliminar(int id);

    void registrar(Membresia membresia);

    void actualizar(Membresia membresia);

    int getDiasRestantes(int idMembresia);

    String getEstadoMembresia(int idMembresia);
}
