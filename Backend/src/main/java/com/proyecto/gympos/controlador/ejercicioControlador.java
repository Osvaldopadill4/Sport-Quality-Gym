package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.EjercicioDao;
import com.proyecto.gympos.modelos.Ejercicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ejercicioControlador {
    @Autowired
    private EjercicioDao ejercicioDao;
    //Listar datos de ejercicio
    @RequestMapping(value = "api/ejercicio", method = RequestMethod.GET)
    public List<Ejercicio> getEjercicios(){
        return ejercicioDao.getEjercicios();
    }
    //Registrar los datos del ejercicio
    @RequestMapping (value = "api/ejercicio" , method = RequestMethod.POST)
    public Ejercicio registrarCliente(@RequestBody Ejercicio ejercicio){
        ejercicioDao.registrar(ejercicio);
        return ejercicio;
    }
    //Editar ejercicio
    @RequestMapping (value = "api/ejercicio/{id}" , method = RequestMethod.PUT)
    public Ejercicio editarCliente(@PathVariable int id, @RequestBody Ejercicio ejercicio) {
        ejercicio.setId(id);
        ejercicioDao.actualizar(ejercicio);
        return ejercicio;
    }
    //Eliminar ejercicio
    @RequestMapping(value = "api/ejercicio/{id}" , method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        ejercicioDao.eliminar(id);
    }

}
