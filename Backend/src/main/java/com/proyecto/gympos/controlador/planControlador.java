package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.PlanDao;
import com.proyecto.gympos.modelos.Plan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class planControlador {
    @Autowired
    private PlanDao planDao;

    //Listar datos de producto
    @RequestMapping(value = "api/plan", method = RequestMethod.GET)
    public List<Plan> getPlanes() {
        return planDao.getPlanes();
    }
    //registrar datos de producto
    @RequestMapping(value = "api/plan", method = RequestMethod.POST)
    public Plan registrarPlan(@RequestBody Plan plan) {
        planDao.registrar(plan);
        return plan;
    }
    //editar producto
    @RequestMapping(value = "api/plan/{id}", method = RequestMethod.PUT)
    public Plan editarPlan(@PathVariable int id, @RequestBody Plan plan) {
        plan.setId(id);
        planDao.actualizar(plan);
        return plan;
    }
    //eliminar producto
    @RequestMapping(value = "api/plan/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        planDao.eliminar(id);
    }

}
