package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.UsuarioDao;
import com.proyecto.gympos.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class authControlador {

    @Autowired
    private UsuarioDao usuarioDao;

    @RequestMapping(value = "api/login", method = RequestMethod.POST)
    public String login(@RequestBody Usuario usuario){
        if(usuarioDao.verificarCredenciales(usuario)){
            return "OK";
        }
        return "FAIL";
    }
}
