package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VistaClientesMembresiaDao;
import com.proyecto.gympos.modelos.VistaClientesMembresia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VistaClientesMembresiaControlador {

    @Autowired
    private VistaClientesMembresiaDao vistaClientesMembresiaDao;

    @GetMapping("/clientes_membresias")
    public List<VistaClientesMembresia> getClientesMembresias() {
        return vistaClientesMembresiaDao.getClientesMembresias();
    }
    @GetMapping("/clientes_membresias/{idCliente}")
    public List<VistaClientesMembresia> getClientesMembresiasPorCliente(@PathVariable int idCliente) {
        return vistaClientesMembresiaDao.getClientesMembresiasPorCliente(idCliente);
    }
}
