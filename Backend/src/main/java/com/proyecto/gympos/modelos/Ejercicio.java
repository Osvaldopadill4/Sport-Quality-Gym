package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ejercicio")
public class Ejercicio {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_rutina")
    private int id_rutina;
    @Getter @Setter @Column(name = "nombre")
    private String nombre;
    @Getter @Setter @Column(name = "series")
    private String fecha_inicio;
    @Getter @Setter @Column(name = "repeticiones")
    private String fecha_vencimiento;
    @Getter @Setter @Column(name = "orden")
    private String orden;
    @Getter @Setter @Column(name = "estado")
    private String estado;

    }
