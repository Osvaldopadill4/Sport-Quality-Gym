package com.proyecto.gympos.controlador;
import com.proyecto.gympos.dao.CompraDao;
import com.proyecto.gympos.modelos.Compra;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class compraControlador {
    @Autowired
    private CompraDao compraDao;
    //Listar datos de compra, se espera usar como reporte si no se usa la vista detalle_compra
    @RequestMapping(value = "api/compra", method = RequestMethod.GET)
    public List<Compra> getCompras() {
        return compraDao.getCompras();
    }
    //registrar datos de compra
    @RequestMapping(value = "api/compra", method = RequestMethod.POST)
    public Compra registrarVenta(@RequestBody Compra compra) {
        compraDao.registrar(compra);
        return compra;
    }
    //editar compra, posiblemente no se use
    @RequestMapping(value = "api/compra/{id}", method = RequestMethod.PUT)
    public Compra editarCompra(@PathVariable int id, @RequestBody Compra compra) {
        compra.setId(id);
        compraDao.actualizar(compra);
        return compra;
    }
    //eliminar compra, posiblemente no se use
    @RequestMapping(value = "api/compra/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        compraDao.eliminar(id);
    }
}
