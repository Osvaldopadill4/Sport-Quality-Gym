package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rutina")
public class Rutina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;

    @Getter @Setter @Column(name = "id_cliente")
    private int id_cliente;

    @Getter @Setter @Column(name = "nombre")
    private String nombre;

    @Getter @Setter @Column(name = "dia_semana")
    private String dia_semana;

    @Getter @Setter @Column(name = "estado")
    private String estado;

    @Transient
    @Getter @Setter
    private List<Ejercicio> ejercicios = new ArrayList<>();
}
