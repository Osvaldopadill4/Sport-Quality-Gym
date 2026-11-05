package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaClientesMembresia;

import java.util.List;

public interface VistaClientesMembresiaDao {
    List<VistaClientesMembresia> getClientesMembresias();
    List<VistaClientesMembresia> getClientesMembresiasPorCliente(int idCliente);
}
