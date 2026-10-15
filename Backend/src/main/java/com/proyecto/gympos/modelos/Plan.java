package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "plan")
public class Plan {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter
    @Setter
    @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "nombre")
    private String nombre;
    @Getter @Setter @Column(name = "descripcion")
    private String descripcion;
    @Getter @Setter @Column(name = "precio")
    private float precio;
    @Getter @Setter @Column(name = "duracion_dias")
    private String duracion_dias;
    @Getter @Setter @Column(name = "estado")
    private String estado;

}
