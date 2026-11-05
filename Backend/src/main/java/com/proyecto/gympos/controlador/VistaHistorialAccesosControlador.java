package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VistaHistorialAccesosDao;
import com.proyecto.gympos.modelos.VistaHistorialAccesos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VistaHistorialAccesosControlador {

    @Autowired
    private VistaHistorialAccesosDao vistaHistorialAccesosDao;

    @GetMapping("/accesos")
    public List<VistaHistorialAccesos> getHistorialAccesos() {
        return vistaHistorialAccesosDao.getHistorialAccesos();
    }

    @GetMapping("/accesos/cliente/{idCliente}")
    public List<VistaHistorialAccesos> getHistorialAccesosPorCliente(@PathVariable int idCliente) {
        return vistaHistorialAccesosDao.getHistorialAccesosPorCliente(idCliente);
    }

    @GetMapping("/accesos/fecha/{fecha}")
    public List<VistaHistorialAccesos> getHistorialAccesosPorFecha(@PathVariable String fecha) {
        return vistaHistorialAccesosDao.getHistorialAccesosPorFecha(fecha);
    }
}
