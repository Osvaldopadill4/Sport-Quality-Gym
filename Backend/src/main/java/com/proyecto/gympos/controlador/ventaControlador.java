package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VentaDao;
import com.proyecto.gympos.modelos.Venta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ventaControlador {

    @Autowired
    private VentaDao ventaDao;

    //Listar datos de venta, se espera usar como reporte si no se usa la vista detalle_ventas
    @RequestMapping(value = "api/venta", method = RequestMethod.GET)
    public List<Venta> getVentas() {
        return ventaDao.getVentas();
    }
    //registrar datos de venta
    @RequestMapping(value = "api/venta", method = RequestMethod.POST)
    public Venta registrarVenta(@RequestBody Venta venta) {
        ventaDao.registrar(venta);
        return venta;
    }
    //editar venta, posiblemente no se use
    @RequestMapping(value = "api/venta/{id}", method = RequestMethod.PUT)
    public Venta editarVenta(@PathVariable int id, @RequestBody Venta venta) {
        venta.setId(id);
        ventaDao.actualizar(venta);
        return venta;
    }
    //eliminar venta, posiblemente no se use
    @RequestMapping(value = "api/venta/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        ventaDao.eliminar(id);
    }
}
