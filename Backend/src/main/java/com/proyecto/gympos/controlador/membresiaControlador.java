package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.MembresiaDao;
import com.proyecto.gympos.modelos.Membresia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    //Obtener días restantes de una membresía usando función MySQL
    @RequestMapping(value = "api/membresia/{id}/dias_restantes", method = RequestMethod.GET)
    public Map<String, Object> getDiasRestantes(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        int dias = membresiaDao.getDiasRestantes(id);
        response.put("id_membresia", id);
        response.put("dias_restantes", dias);
        return response;
    }

    //Obtener estado de una membresía usando función MySQL
    @RequestMapping(value = "api/membresia/{id}/estado", method = RequestMethod.GET)
    public Map<String, Object> getEstadoMembresia(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        String estado = membresiaDao.getEstadoMembresia(id);
        response.put("id_membresia", id);
        response.put("estado", estado);
        return response;
    }

}
