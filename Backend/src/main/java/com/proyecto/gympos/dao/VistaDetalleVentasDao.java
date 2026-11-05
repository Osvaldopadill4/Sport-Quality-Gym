package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaDetalleVentas;

import java.util.List;

public interface VistaDetalleVentasDao {
    List<VistaDetalleVentas> getDetalleVentas();
    List<VistaDetalleVentas> getDetalleVentasPorCliente(int idCliente);
    List<VistaDetalleVentas> getDetalleVentasPorFecha(String fechaInicio, String fechaFin);
}
