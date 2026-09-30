package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.UsuarioDao;
import com.proyecto.gympos.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // Permite que React (Puerto 3000) se conecte sin bloqueos
public class usuarioControlador {

    @Autowired
    private UsuarioDao usuarioDao;

    // --- ENDPOINT PARA LOGIN ---
    @RequestMapping(value = "api/login", method = RequestMethod.POST)
    public Usuario login(@RequestBody Usuario usuarioLogin) {
        // Le pasamos el correo y contraseña al DAO para que verifique en la BD

        // Si las credenciales están mal, usuarioValidado será null.
        // Si están bien, regresará los datos del usuario. Spring Boot lo convierte a JSON para React.
        return usuarioDao.verificarCredenciales(usuarioLogin.getCorreo(), usuarioLogin.getContrasena());
    }

    // --- ENDPOINT PARA TRAER UN USUARIO FALSO POR ID (EJEMPLO ANTERIOR) ---
    @RequestMapping(value = "api/usuario/{id}" , method = RequestMethod.GET)
    public Usuario getUsuario(@PathVariable int id ){
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

    // --- ENDPOINT PARA CREAR UN NUEVO USUARIO ---
    @RequestMapping(value= "api/usuarios", method = RequestMethod.POST)
    public void registrarUsuario(@RequestBody Usuario usuario){
        usuarioDao.registrar(usuario);
    }

    // --- ENDPOINT PARA TRAER TODOS LOS USUARIOS ---
    @RequestMapping(value = "api/usuario", method = RequestMethod.GET)
    public List<Usuario> getUsuarioLista(){
        return usuarioDao.getUsuarios();
    }

    // --- ENDPOINT PARA ELIMINAR USUARIO ---
    @RequestMapping(value = "api/usuario/{id}" , method = RequestMethod.DELETE )
    public void eliminar(@PathVariable int id){
        usuarioDao.eliminar(id);
    }
}
