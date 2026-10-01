package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.UsuarioDao;
import com.proyecto.gympos.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class usuarioControlador {

    @Autowired
    private UsuarioDao usuarioDao;

    //Datos de usuario
    @RequestMapping(value = "api/usuario/{id}", method = RequestMethod.GET)
    public Usuario getUsuario(@PathVariable int id) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setId_rol(0);
        usuario.setNombre("Lucas");
        usuario.setApellido("Gutierrez");
        usuario.setTelefono("1234321565");
        usuario.setCorreo("lucas73@gmail.com");
        usuario.setEstado("Activo");
        return usuario;
    }
    //Listar datos de usuario
    @RequestMapping(value = "api/usuario", method = RequestMethod.GET)
    public List<Usuario> getUsuarios() {
        return usuarioDao.getUsuarios();
    }
    //registrar datos de usuario
    @RequestMapping(value = "api/usuario", method = RequestMethod.POST)
    public Usuario registrarUsuario(@RequestBody Usuario usuario) {
        usuarioDao.registrar(usuario);
        return usuario;
    }
    //editar usuario
    @RequestMapping(value = "api/usuario/{id}", method = RequestMethod.PUT)
    public Usuario editarUsuario(@PathVariable int id, @RequestBody Usuario usuario) {
        usuario.setId(id);
        usuarioDao.actualizar(usuario);
        return usuario;
    }
    //eliminar usuario
    @RequestMapping(value = "api/usuario/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        usuarioDao.eliminar(id);
    }
}
