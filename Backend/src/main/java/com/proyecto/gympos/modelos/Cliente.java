package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cliente")
public class Cliente {
    //Cliente
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter
    @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "nombre")
    private String nombre;
    @Getter @Setter @Column(name = "telefono")
    private String telefono;
    @Getter @Setter @Column(name = "contrasena")
    private String contrasena;
    @Getter @Setter @Column(name = "contacto_emergencia")
    private String contacto_emergencia;
    @Getter @Setter @Column(name = "telefono_emergencia")
    private String telefono_emergencia;
    @Getter @Setter @Column(name = "fecha_registro")
    private String fecha_registro;
    @Getter @Setter @Column(name = "token_qr")
    private String token_qr;
    @Getter @Setter @Column(name = "estado")
    private String estado;
}
