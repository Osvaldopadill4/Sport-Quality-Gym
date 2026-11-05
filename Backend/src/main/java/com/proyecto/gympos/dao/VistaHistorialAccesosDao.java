package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaHistorialAccesos;

import java.util.List;

public interface VistaHistorialAccesosDao {
    List<VistaHistorialAccesos> getHistorialAccesos();
    List<VistaHistorialAccesos> getHistorialAccesosPorCliente(int idCliente);
    List<VistaHistorialAccesos> getHistorialAccesosPorFecha(String fecha);
}
