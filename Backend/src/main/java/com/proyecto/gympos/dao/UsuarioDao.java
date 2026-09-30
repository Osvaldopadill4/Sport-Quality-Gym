package com.proyecto.gympos.dao;

import com.proyecto.gympos.modelos.Usuario;

import java.util.List;

public interface UsuarioDao {

    List<Usuario> getUsuarios();

    void eliminar(int id);

    void registrar(Usuario usuario);

    // Método nuevo para revisar si el correo y contraseña existen
    Usuario verificarCredenciales(String correo, String contrasena);
}
