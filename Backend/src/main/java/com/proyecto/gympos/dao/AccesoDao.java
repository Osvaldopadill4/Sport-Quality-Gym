package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Acceso;

import java.util.List;

public interface AccesoDao {

    void registrar(Acceso acceso);

    String registrarConProcedure(int idCliente);

    List<Acceso> getAccesosPorCliente(int clienteId);

    List<Acceso> getAccesos();
}
