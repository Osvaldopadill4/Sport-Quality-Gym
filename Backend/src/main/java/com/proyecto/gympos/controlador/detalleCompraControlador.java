package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.Detalle_CompraDao;
import com.proyecto.gympos.modelos.Detalle_compra;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class detalleCompraControlador {
    @Autowired
    private Detalle_CompraDao detalleCompraDao;

    //Listar datos de detalle_compra, se espera usar como reporte si no se usa la vista detalle_ventas
    @RequestMapping(value = "api/detalle_compra", method = RequestMethod.GET)
    public List<Detalle_compra> getDetalle_compras() {
        return detalleCompraDao.getDetalle_compras();
    }
    //registrar datos de detalle_compra
    @RequestMapping(value = "api/detalle_compra", method = RequestMethod.POST)
    public Detalle_compra registrarVenta(@RequestBody Detalle_compra detalle_compra) {
        detalleCompraDao.registrar(detalle_compra);
        return detalle_compra;
    }
    //editar detalle_compra, posiblemente no se use
    @RequestMapping(value = "api/detalle_compra/{id}", method = RequestMethod.PUT)
    public Detalle_compra editarVenta(@PathVariable int id, @RequestBody Detalle_compra detalle_compra) {
        detalle_compra.setId(id);
        detalleCompraDao.actualizar(detalle_compra);
        return detalle_compra;
    }
    //eliminar detalle_compra, posiblemente no se use
    @RequestMapping(value = "api/detalle_compra/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        detalleCompraDao.eliminar(id);
    }
}
