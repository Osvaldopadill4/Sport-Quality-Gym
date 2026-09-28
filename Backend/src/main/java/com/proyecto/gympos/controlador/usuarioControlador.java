package com.proyecto.gympos.controlador;

import com.proyecto.gympos.modelos.Usuario;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class usuarioControlador {

    @RequestMapping(value = "usuario/{id}")
    public Usuario getUsuario(@PathVariable int id ){
        Usuario usuario = new Usuario();
        usuario.set
    }
}
