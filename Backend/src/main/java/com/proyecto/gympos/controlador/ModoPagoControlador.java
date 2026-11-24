package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.ModoPagoDao;
import com.proyecto.gympos.modelos.ModoPago;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modo_pago")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ModoPagoControlador {

    @Autowired
    private ModoPagoDao modoPagoDao;

    @GetMapping
    public List<ModoPago> getModosPago() {
        return modoPagoDao.getModosPago();
    }

    @GetMapping("/{id}")
    public ModoPago getModoPagoPorId(@PathVariable int id) {
        return modoPagoDao.getModoPagoPorId(id);
    }
}
