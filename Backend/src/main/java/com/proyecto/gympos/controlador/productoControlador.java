package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.ProductoDao;
import com.proyecto.gympos.modelos.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class productoControlador {
    @Autowired
    private ProductoDao productoDao;

    //Listar datos de producto
    @RequestMapping(value = "api/producto", method = RequestMethod.GET)
    public List<Producto> getProductos() {
        return productoDao.getProductos();
    }
    //registrar datos de producto
    @RequestMapping(value = "api/producto", method = RequestMethod.POST)
    public Producto registrarProducto(@RequestBody Producto producto) {
        productoDao.registrar(producto);
        return producto;
    }
    //editar producto
    @RequestMapping(value = "api/producto/{id}", method = RequestMethod.PUT)
    public Producto editarProducto(@PathVariable int id, @RequestBody Producto producto) {
        producto.setId(id);
        productoDao.actualizar(producto);
        return producto;
    }
    //eliminar producto
    @RequestMapping(value = "api/producto/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        productoDao.eliminar(id);
    }

}
