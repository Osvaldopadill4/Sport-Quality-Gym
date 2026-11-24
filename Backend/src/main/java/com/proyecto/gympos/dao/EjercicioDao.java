package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Ejercicio;
import java.util.List;

public interface EjercicioDao {
    List<Ejercicio> getEjercicios();

    List<Ejercicio> getEjerciciosPorRutina(int idRutina);

    void eliminarPorRutina(int idRutina);

    void eliminar(int id);

    void registrar(Ejercicio ejercicio);

    void actualizar(Ejercicio ejercicio);
}
