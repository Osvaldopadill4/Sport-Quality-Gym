package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.UsuarioDao;
import com.proyecto.gympos.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class authControlador {

    @Autowired
    private UsuarioDao usuarioDao;

    @PersistenceContext
    EntityManager entityManager;

    @RequestMapping(value = "api/login", method = RequestMethod.POST)
    public Usuario login(@RequestBody Usuario usuario){
        if(usuarioDao.verificarCredenciales(usuario)){
            String query = "FROM Usuario WHERE correo = :correo AND contrasena = :contrasena";
            List<Usuario> lista = entityManager.createQuery(query)
                    .setParameter("correo", usuario.getCorreo())
                    .setParameter("contrasena", usuario.getContrasena())
                    .getResultList();
            if (!lista.isEmpty()) {
                Usuario usuarioEncontrado = lista.get(0);
                // Convertir estado "1"/"0" a "Activo"/"Inactivo" para el frontend
                String estado = usuarioEncontrado.getEstado();
                usuarioEncontrado.setEstado("1".equals(estado) ? "Activo" : "Inactivo");
                return usuarioEncontrado;
            }
        }
        return null;
    }

}
