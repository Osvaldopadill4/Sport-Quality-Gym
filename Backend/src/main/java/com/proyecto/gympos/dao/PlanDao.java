package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Plan;

import java.util.List;

public interface PlanDao {
    List<Plan> getPlanes();

    void eliminar(int id);

    void registrar(Plan plan);

    void actualizar(Plan plan);
}
