package com.proyecto.gympos.modelos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @Getter @Setter @Column(name = "id")
    private int id_usuario;
    @Getter @Setter @Column(name = "rol")
    private int id_rol;
    @Getter @Setter @Column(name = "nombre")
    private String nombre;
    @Getter @Setter @Column(name = "correo")
    private String correo;
    @Getter @Setter @Column(name = "contrasena")
    private String contrasena;
    @Getter @Setter @Column(name = "estado")
    private String estado;

}