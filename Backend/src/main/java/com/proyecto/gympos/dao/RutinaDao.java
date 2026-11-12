package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Rutina;

import java.util.List;

public interface RutinaDao {
    List<Rutina> getRutinas();

    void eliminar(int id);

    void registrar(Rutina rutina);

    void actualizar(Rutina rutina);
}
