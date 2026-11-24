package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VistaDetalleVentasDao;
import com.proyecto.gympos.modelos.VistaDetalleVentas;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VistaDetalleVentasControlador {

    @Autowired
    private VistaDetalleVentasDao vistaDetalleVentasDao;
    @GetMapping("/ventas")
    public List<VistaDetalleVentas> getDetalleVentas() {
        return vistaDetalleVentasDao.getDetalleVentas();
    }
    @GetMapping("/ventas/cliente/{idCliente}")
    public List<VistaDetalleVentas> getDetalleVentasPorCliente(@PathVariable int idCliente) {
        return vistaDetalleVentasDao.getDetalleVentasPorCliente(idCliente);
    }
    @GetMapping("/ventas/fechas")
    public List<VistaDetalleVentas> getDetalleVentasPorFecha(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        return vistaDetalleVentasDao.getDetalleVentasPorFecha(fechaInicio, fechaFin);
    }
}
