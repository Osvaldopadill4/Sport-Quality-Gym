package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.VistaInventarioBajo;

import java.util.List;

public interface VistaInventarioBajoDao {
    List<VistaInventarioBajo> getInventarioBajo();
    List<VistaInventarioBajo> getInventarioBajoPorCategoria(String categoria);
}
