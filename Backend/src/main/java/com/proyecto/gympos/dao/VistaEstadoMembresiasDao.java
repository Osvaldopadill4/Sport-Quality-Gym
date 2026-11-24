package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaEstadoMembresias;

import java.util.List;

public interface VistaEstadoMembresiasDao {
    List<VistaEstadoMembresias> getEstadosMembresias();
    List<VistaEstadoMembresias> getMembresiasPorVencer(int dias);
    List<VistaEstadoMembresias> getEstadoMembresiaPorCliente(int idCliente);
}
