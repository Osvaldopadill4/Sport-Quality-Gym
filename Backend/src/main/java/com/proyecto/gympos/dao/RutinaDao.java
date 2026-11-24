package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Rutina;
import java.util.List;

public interface RutinaDao {
    List<Rutina> getRutinas();

    List<Rutina> getRutinasPorCliente(int idCliente);

    Rutina getRutinaPorId(int id);

    int contarRutinasActivasPorCliente(int idCliente);

    void eliminar(int id);

    void registrar(Rutina rutina);

    void actualizar(Rutina rutina);
}
