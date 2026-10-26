package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.Detalle_ventaDao;
import com.proyecto.gympos.modelos.Detalle_venta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class detalleVentaControlador {

    @Autowired
    private Detalle_ventaDao detalleVentaDao;

    //Listar datos de venta, se espera usar como reporte si no se usa la vista detalle_ventas
    @RequestMapping(value = "api/detalle_venta", method = RequestMethod.GET)
    public List<Detalle_venta> getDetalle_ventas() {
        return detalleVentaDao.getDetalle_ventas();
    }
    //registrar datos de venta
    @RequestMapping(value = "api/detalle_venta", method = RequestMethod.POST)
    public Detalle_venta registrarVenta(@RequestBody Detalle_venta detalle_venta) {
        detalleVentaDao.registrar(detalle_venta);
        return detalle_venta;
    }
    //editar venta, posiblemente no se use
    @RequestMapping(value = "api/detalle_venta/{id}", method = RequestMethod.PUT)
    public Detalle_venta editarVenta(@PathVariable int id, @RequestBody Detalle_venta detalle_venta) {
        detalle_venta.setId(id);
        detalleVentaDao.actualizar(detalle_venta);
        return detalle_venta;
    }
    //eliminar venta, posiblemente no se use
    @RequestMapping(value = "api/detalle_venta/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        detalleVentaDao.eliminar(id);
    }
}
