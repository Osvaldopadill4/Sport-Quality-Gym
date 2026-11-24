package com.proyecto.gympos.controlador;
import com.proyecto.gympos.dao.CorteCajaDao;
import com.proyecto.gympos.modelos.Corte_caja;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class corteCajaControlador {
    @Autowired
    private CorteCajaDao corteCajaDao;
    //Listar corte de caja, se espera usar como reporte si no se usa la vista detalle_compra
    @RequestMapping(value = "api/corte_caja", method = RequestMethod.GET)
    public List<Corte_caja> getCorteCajas() {
        return corteCajaDao.getCorteCajas();
    }
    //registrar datos de corte de caja
    @RequestMapping(value = "api/corte_caja", method = RequestMethod.POST)
    public Corte_caja registrarCorteCaja(@RequestBody Corte_caja corteCaja) {
        corteCajaDao.registrar(corteCaja);
        return corteCaja;
    }
    //editar corte de caja, posiblemente no se use
    @RequestMapping(value = "api/corte_caja/{id}", method = RequestMethod.PUT)
    public Corte_caja editarCompra(@PathVariable int id, @RequestBody Corte_caja corteCaja) {
        corteCaja.setId(id);
        corteCajaDao.actualizar(corteCaja);
        return corteCaja;
    }
    //eliminar corte de caja, posiblemente no se use
    @RequestMapping(value = "api/corte_caja/{id}", method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        corteCajaDao.eliminar(id);
    }
}
