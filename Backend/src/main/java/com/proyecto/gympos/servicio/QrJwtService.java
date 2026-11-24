package com.proyecto.gympos.servicio;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class QrJwtService {

    private final Key key;
    private final long tiempoExpiracion;

    public QrJwtService(
            @Value("${gympos.qr.secret-key}") String secretKey,
            @Value("${gympos.qr.expiration-ms}") long tiempoExpiracion) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.tiempoExpiracion = tiempoExpiracion;
    }

    /**
     * Genera un token JWT con el ID del cliente.
     * Este token se usará para generar el QR en la app móvil.
     * Expira según gympos.qr.expiration-ms (por defecto 60 segundos).
     */
    public String generarQrToken(int clienteId) {
        return Jwts.builder()
                .setSubject(String.valueOf(clienteId))
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + tiempoExpiracion))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Valida un token JWT leído desde el QR.
     * @return el ID del cliente si el token es válido y no ha expirado, null si no.
     */
    public Integer validarQrToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Si llega aquí, el token es válido y no ha expirado
            return Integer.parseInt(claims.getSubject());

        } catch (Exception e) {
            // Token expirado, alterado o inválido
            return null;
        }
    }
}
