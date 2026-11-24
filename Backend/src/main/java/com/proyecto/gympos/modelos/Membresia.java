package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "membresia")
public class Membresia {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_cliente")
    private int id_cliente;
    @Getter @Setter @Column(name = "id_plan")
    private int id_plan;
    @Getter @Setter @Column(name = "fecha_inicio")
    private String fecha_inicio;
    @Getter @Setter @Column(name = "fecha_vencimiento")
    private String fecha_vencimiento;
    @Getter @Setter @Column(name = "estado")
    private String estado;

}
