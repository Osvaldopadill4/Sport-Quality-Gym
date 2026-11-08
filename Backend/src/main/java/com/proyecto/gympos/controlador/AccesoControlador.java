package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.AccesoDao;
import com.proyecto.gympos.dao.ClienteDao;
import com.proyecto.gympos.modelos.Acceso;
import com.proyecto.gympos.modelos.Cliente;
import com.proyecto.gympos.servicio.QrJwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/acceso")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AccesoControlador {

    @Autowired
    private QrJwtService qrJwtService;

    @Autowired
    private ClienteDao clienteDao;

    @Autowired
    private AccesoDao accesoDao;

    /**
     * A) La app móvil del cliente llama a este endpoint para obtener un token JWT.
     *    El frontend de la app convierte este token en un código QR.
     *    El token expira en 60 segundos para evitar capturas de pantalla.
     */
    @GetMapping("/generar-qr/{clienteId}")
    public ResponseEntity<?> obtenerQr(@PathVariable int clienteId) {
        Map<String, Object> response = new HashMap<>();

        // Verificar que el cliente existe
        Cliente cliente = clienteDao.getClientePorId(clienteId);
        if (cliente == null) {
            response.put("error", true);
            response.put("mensaje", "Cliente no encontrado");
            return ResponseEntity.status(404).body(response);
        }

        // Verificar que el cliente está activo
        if (cliente.getEstado() == null || !cliente.getEstado().equals("1")) {
            response.put("error", true);
            response.put("mensaje", "Cliente inactivo. No se puede generar el QR.");
            return ResponseEntity.status(403).body(response);
        }

        // TODO: Verificar que el cliente tiene membresía activa
        // if (!membresiaService.tieneMembresiaActiva(clienteId)) {
        //     response.put("error", true);
        //     response.put("mensaje", "Membresía vencida");
        //     return ResponseEntity.status(403).body(response);
        // }

        // Generar el token JWT
        String token = qrJwtService.generarQrToken(clienteId);

        response.put("error", false);
        response.put("token", token);
        response.put("clienteNombre", cliente.getNombre());
        response.put("mensaje", "QR generado exitosamente. Válido por 60 segundos.");

        return ResponseEntity.ok(response);
    }

    /**
     * B) El lector de QR del gimnasio (torniquete/recepción) llama a este endpoint.
     *    Recibe el token leído del QR, lo valida, y registra el acceso.
     */
    @PostMapping("/validar-qr")
    public ResponseEntity<?> validarAcceso(@RequestBody Map<String, String> body) { return validarAccesoConProcedure(body); }
    public ResponseEntity<?> validarAccesoLegado(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String qrTokenLeido = body.get("token");

        if (qrTokenLeido == null || qrTokenLeido.isBlank()) {
            response.put("acceso", false);
            response.put("mensaje", "No se recibió token QR");
            return ResponseEntity.status(400).body(response);
        }

        // Validar el token JWT
        Integer clienteId = qrJwtService.validarQrToken(qrTokenLeido);
        if (clienteId == null) {
            try {
                if (qrTokenLeido.matches("^\\d+$")) {
                    clienteId = Integer.parseInt(qrTokenLeido);
                } else {
                    List<Cliente> clientes = clienteDao.getClientes();
                    if (clientes != null) {
                        for (Cliente c : clientes) {
                            if (c.getToken_qr() != null && qrTokenLeido.equalsIgnoreCase(c.getToken_qr().trim())) {
                                clienteId = c.getId();
                                break;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (clienteId == null) {
            // Registrar intento fallido (token inválido o expirado)
            response.put("acceso", false);
            response.put("mensaje", "Acceso denegado: Código QR expirado o inválido");
            return ResponseEntity.status(401).body(response);
        }

        // Verificar que el cliente existe
        Cliente cliente = clienteDao.getClientePorId(clienteId);
        if (cliente == null) {
            response.put("acceso", false);
            response.put("mensaje", "Acceso denegado: Cliente no encontrado");
            return ResponseEntity.status(404).body(response);
        }

        // Registrar el acceso exitoso en la tabla `acceso`
        Acceso acceso = new Acceso();
        acceso.setId_cliente(clienteId);
        acceso.setFecha(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        acceso.setHora(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        acceso.setResultado("CONCEDIDO");
        accesoDao.registrar(acceso);

        response.put("acceso", true);
        response.put("clienteId", clienteId);
        response.put("clienteNombre", cliente.getNombre());
        response.put("mensaje", "Acceso concedido para: " + cliente.getNombre());
        response.put("horaEntrada", acceso.getHora());

        return ResponseEntity.ok(response);
    }

    /**
     * B2) Opción alternativa: Registrar acceso usando el stored procedure.
     *    El procedure valida membresía activa y registra el acceso automáticamente.
     */
    @PostMapping("/validar-qr-con-procedure")
    public ResponseEntity<?> validarAccesoConProcedure(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String qrTokenLeido = body.get("token");

        if (qrTokenLeido == null || qrTokenLeido.isBlank()) {
            response.put("acceso", false);
            response.put("mensaje", "No se recibió token QR");
            return ResponseEntity.status(400).body(response);
        }

        // Validar el token JWT
        Integer clienteId = qrJwtService.validarQrToken(qrTokenLeido);
        if (clienteId == null) {
            try {
                if (qrTokenLeido.matches("^\\d+$")) {
                    clienteId = Integer.parseInt(qrTokenLeido);
                } else {
                    List<Cliente> clientes = clienteDao.getClientes();
                    if (clientes != null) {
                        for (Cliente c : clientes) {
                            if (c.getToken_qr() != null && qrTokenLeido.equalsIgnoreCase(c.getToken_qr().trim())) {
                                clienteId = c.getId();
                                break;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (clienteId == null) {
            response.put("acceso", false);
            response.put("mensaje", "Acceso denegado: Código QR expirado o inválido");
            return ResponseEntity.status(401).body(response);
        }

        // Verificar que el cliente existe
        Cliente cliente = clienteDao.getClientePorId(clienteId);
        if (cliente == null) {
            response.put("acceso", false);
            response.put("mensaje", "Acceso denegado: Cliente no encontrado");
            return ResponseEntity.status(404).body(response);
        }

        // Usar el stored procedure para registrar acceso
        String resultado = accesoDao.registrarConProcedure(clienteId);

        response.put("acceso", "Permitido".equals(resultado));
        response.put("clienteId", clienteId);
        response.put("clienteNombre", cliente.getNombre());
        response.put("mensaje", resultado.equals("Permitido") ? "Acceso concedido" : "Acceso denegado: Membresía inactiva o vencida");
        response.put("resultado", resultado);

        return ResponseEntity.ok(response);
    }

    /**
     * C) Consultar el historial de accesos de un cliente.
     */
    @GetMapping("/historial/{clienteId}")
    public ResponseEntity<?> historialAccesos(@PathVariable int clienteId) {
        List<Acceso> accesos = accesoDao.getAccesosPorCliente(clienteId);
        return ResponseEntity.ok(accesos);
    }

    /**
     * D) Consultar todos los accesos (para panel admin).
     */
    @GetMapping("/historial")
    public ResponseEntity<?> todosLosAccesos() {
        List<Acceso> accesos = accesoDao.getAccesos();
        return ResponseEntity.ok(accesos);
    }
}
