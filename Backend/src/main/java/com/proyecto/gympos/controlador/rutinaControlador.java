package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.EjercicioDao;
import com.proyecto.gympos.dao.RutinaDao;
import com.proyecto.gympos.modelos.Ejercicio;
import com.proyecto.gympos.modelos.Rutina;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class rutinaControlador {

    private static final int MAX_RUTINAS_ACTIVAS = 7;

    @Autowired
    private RutinaDao rutinaDao;

    @Autowired
    private EjercicioDao ejercicioDao;

    // Listar todas las rutinas activas (Admin / Recepción)
    @RequestMapping(value = "api/rutina", method = RequestMethod.GET)
    public List<Rutina> getRutinas() {
        return rutinaDao.getRutinas();
    }

    // Listar rutinas de un cliente específico con sus ejercicios
    @RequestMapping(value = "api/rutina/cliente/{idCliente}", method = RequestMethod.GET)
    public List<Rutina> getRutinasCliente(@PathVariable int idCliente) {
        List<Rutina> rutinas = rutinaDao.getRutinasPorCliente(idCliente);
        for (Rutina r : rutinas) {
            r.setEjercicios(ejercicioDao.getEjerciciosPorRutina(r.getId()));
        }
        return rutinas;
    }

    // Registrar rutina para un cliente específico (con límite de 7 activas)
    @RequestMapping(value = "api/rutina/cliente/{idCliente}", method = RequestMethod.POST)
    @Transactional
    public ResponseEntity<?> registrarRutinaCliente(@PathVariable int idCliente, @RequestBody Rutina rutina) {
        int activas = rutinaDao.contarRutinasActivasPorCliente(idCliente);
        if (activas >= MAX_RUTINAS_ACTIVAS) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", true);
            err.put("mensaje", "Límite de " + MAX_RUTINAS_ACTIVAS + " rutinas activas alcanzado. Reutiliza o elimina alguna de tus rutinas.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        rutina.setId_cliente(idCliente);
        rutina.setEstado("1");
        rutinaDao.registrar(rutina); // Genera el ID autoincrementable

        if (rutina.getEjercicios() != null && !rutina.getEjercicios().isEmpty()) {
            int orden = 1;
            for (Ejercicio ej : rutina.getEjercicios()) {
                ej.setId_rutina(rutina.getId());
                ej.setEstado("1");
                ej.setOrden(String.valueOf(orden++));
                ejercicioDao.registrar(ej);
            }
        }

        rutina.setEjercicios(ejercicioDao.getEjerciciosPorRutina(rutina.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(rutina);
    }

    // Registrar rutina genérica (retrocompatibilidad)
    @RequestMapping(value = "api/rutina", method = RequestMethod.POST)
    public Rutina registrarRutina(@RequestBody Rutina rutina) {
        rutina.setEstado("1");
        rutinaDao.registrar(rutina);
        return rutina;
    }

    // Editar rutina y sus ejercicios
    @RequestMapping(value = "api/rutina/{id}", method = RequestMethod.PUT)
    @Transactional
    public ResponseEntity<?> editarRutina(@PathVariable int id, @RequestBody Rutina rutina) {
        Rutina existente = rutinaDao.getRutinaPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        existente.setNombre(rutina.getNombre());
        if (rutina.getDia_semana() != null) {
            existente.setDia_semana(rutina.getDia_semana());
        }
        rutinaDao.actualizar(existente);

        if (rutina.getEjercicios() != null) {
            // Desactivar ejercicios previos de esta rutina
            ejercicioDao.eliminarPorRutina(id);
            int orden = 1;
            for (Ejercicio ej : rutina.getEjercicios()) {
                ej.setId_rutina(id);
                ej.setEstado("1");
                ej.setOrden(String.valueOf(orden++));
                ejercicioDao.registrar(ej);
            }
        }

        existente.setEjercicios(ejercicioDao.getEjerciciosPorRutina(id));
        return ResponseEntity.ok(existente);
    }

    // Eliminar rutina (Borrado lógico: estado = '0')
    @RequestMapping(value = "api/rutina/{id}", method = RequestMethod.DELETE)
    @Transactional
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        rutinaDao.eliminar(id);
        ejercicioDao.eliminarPorRutina(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Rutina eliminada correctamente");
        return ResponseEntity.ok(resp);
    }

    // Obtener plan semanal del cliente
    @RequestMapping(value = "api/rutina/plan-semanal/{idCliente}", method = RequestMethod.GET)
    public Map<String, List<String>> getPlanSemanal(@PathVariable int idCliente) {
        Map<String, List<String>> plan = new HashMap<>();
        String[] dias = {"lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"};
        for (String dia : dias) {
            plan.put(dia, new ArrayList<>());
        }

        List<Rutina> rutinas = rutinaDao.getRutinasPorCliente(idCliente);
        for (Rutina r : rutinas) {
            if (r.getDia_semana() != null && !r.getDia_semana().isEmpty()) {
                String[] diasAsignados = r.getDia_semana().toLowerCase().split(",");
                for (String dia : diasAsignados) {
                    String dClean = dia.trim();
                    if (plan.containsKey(dClean)) {
                        plan.get(dClean).add(String.valueOf(r.getId()));
                    }
                }
            }
        }
        return plan;
    }

    // Guardar plan semanal del cliente
    @RequestMapping(value = "api/rutina/plan-semanal/{idCliente}", method = RequestMethod.POST)
    @Transactional
    public ResponseEntity<?> guardarPlanSemanal(@PathVariable int idCliente, @RequestBody Map<String, List<String>> plan) {
        List<Rutina> rutinas = rutinaDao.getRutinasPorCliente(idCliente);

        for (Rutina r : rutinas) {
            String rId = String.valueOf(r.getId());
            List<String> diasParaRutina = new ArrayList<>();

            for (Map.Entry<String, List<String>> entry : plan.entrySet()) {
                if (entry.getValue() != null && entry.getValue().contains(rId)) {
                    diasParaRutina.add(entry.getKey().toLowerCase());
                }
            }

            r.setDia_semana(String.join(",", diasParaRutina));
            rutinaDao.actualizar(r);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Plan semanal guardado correctamente");
        return ResponseEntity.ok(resp);
    }
}
