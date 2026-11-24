package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VistaEstadoMembresiasDao;
import com.proyecto.gympos.modelos.VistaEstadoMembresias;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VistaEstadoMembresiasControlador {

    @Autowired
    private VistaEstadoMembresiasDao vistaEstadoMembresiasDao;

    @GetMapping("/estado_membresias")
    public List<VistaEstadoMembresias> getEstadosMembresias() {
        return vistaEstadoMembresiasDao.getEstadosMembresias();
    }

    @GetMapping("/estado_membresias/por_vencer/{dias}")
    public List<VistaEstadoMembresias> getMembresiasPorVencer(@PathVariable int dias) {
        return vistaEstadoMembresiasDao.getMembresiasPorVencer(dias);
    }

    @GetMapping("/estado_membresias/cliente/{idCliente}")
    public List<VistaEstadoMembresias> getEstadoMembresiaPorCliente(@PathVariable int idCliente) {
        return vistaEstadoMembresiasDao.getEstadoMembresiaPorCliente(idCliente);
    }
}
