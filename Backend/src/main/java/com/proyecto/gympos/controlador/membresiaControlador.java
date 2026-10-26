package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.MembresiaDao;
import com.proyecto.gympos.modelos.Membresia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class membresiaControlador {
    @Autowired
    private MembresiaDao membresiaDao;

    //Listar datos de membresia
    @RequestMapping(value = "api/membresia", method = RequestMethod.GET)
    public List<Membresia> getMembresias() {
        return membresiaDao.getMembresias();
    }
    //registrar datos de membresia
    @RequestMapping(value = "api/membresia", method = RequestMethod.POST)
    public Membresia registrarMembresia(@RequestBody Membresia membresia) {
        membresiaDao.registrar(membresia);
        return membresia;
    }
    //editar membresia
    @RequestMapping(value = "api/membresia/{id}", method = RequestMethod.PUT)
    public Membresia editarMembresia(@PathVariable int id, @RequestBody Membresia membresia) {
        membresia.setId(id);
        membresiaDao.actualizar(membresia);
        return membresia;
    }
    //eliminar membresia
    @RequestMapping(value = "api/membresia/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        membresiaDao.eliminar(id);
    }

}
