package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.ProveedorDao;
import com.proyecto.gympos.modelos.Proveedor;
import com.proyecto.gympos.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class proveedorControlador {

    @Autowired
    private ProveedorDao proveedorDao;

    //Listar datos de proveedor
    @RequestMapping(value = "api/proveedor", method = RequestMethod.GET)
    public List<Proveedor> getProveedores() {
        return proveedorDao.getProveedores();
    }
    //registrar datos de proveedor
    @RequestMapping(value = "api/proveedor", method = RequestMethod.POST)
    public Proveedor registrarProveedor(@RequestBody Proveedor proveedor) {
        proveedorDao.registrar(proveedor);
        return proveedor;
    }
    //editar usuario
    @RequestMapping(value = "api/proveedor/{id}", method = RequestMethod.PUT)
    public Proveedor editarProveedor(@PathVariable int id, @RequestBody Proveedor proveedor) {
        proveedor.setId(id);
        proveedorDao.actualizar(proveedor);
        return proveedor;
    }
    //eliminar usuario
    @RequestMapping(value = "api/proveedor/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        proveedorDao.eliminar(id);
    }

}
