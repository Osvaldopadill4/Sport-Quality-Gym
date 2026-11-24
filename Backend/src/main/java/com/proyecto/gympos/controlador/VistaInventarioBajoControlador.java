package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.VistaInventarioBajoDao;
import com.proyecto.gympos.modelos.VistaInventarioBajo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VistaInventarioBajoControlador {

    @Autowired
    private VistaInventarioBajoDao vistaInventarioBajoDao;

    @GetMapping("/inventario_bajo")
    public List<VistaInventarioBajo> getInventarioBajo() {
        return vistaInventarioBajoDao.getInventarioBajo();
    }

    @GetMapping("/inventario_bajo/categoria/{categoria}")
    public List<VistaInventarioBajo> getInventarioBajoPorCategoria(@PathVariable String categoria) {
        return vistaInventarioBajoDao.getInventarioBajoPorCategoria(categoria);
    }
}
