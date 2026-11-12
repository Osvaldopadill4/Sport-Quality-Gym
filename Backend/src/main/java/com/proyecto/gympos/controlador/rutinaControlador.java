package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.RutinaDao;
import com.proyecto.gympos.modelos.Rutina;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class rutinaControlador {
    @Autowired
    private RutinaDao rutinaDao;
    //Listar datos de cliente
    @RequestMapping(value = "api/rutina", method = RequestMethod.GET)
    public List<Rutina> getRutinas(){
        return rutinaDao.getRutinas();
    }
    //Registrar los datos del cliente
    @RequestMapping (value = "api/rutina" , method = RequestMethod.POST)
    public Rutina registrarCliente(@RequestBody Rutina rutina){
        rutinaDao.registrar(rutina);
        return rutina;
    }
    //Editar cliente
    @RequestMapping (value = "api/rutina/{id}" , method = RequestMethod.PUT)
    public Rutina editarCliente(@PathVariable int id, @RequestBody Rutina rutina) {
        rutina.setId(id);
        rutinaDao.actualizar(rutina);
        return rutina;
    }
    //Eliminar cliente
    @RequestMapping(value = "api/rutina/{id}" , method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        rutinaDao.eliminar(id);
    }

}
