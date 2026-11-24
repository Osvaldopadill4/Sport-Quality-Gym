package com.proyecto.gympos.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class PruebaControlador {

    @GetMapping
    public Map<String, String> probarConexion() {
        return Map.of(
                "status", "ok",
                "message", "Backend GymPos funcionando"
        );
    }
}
