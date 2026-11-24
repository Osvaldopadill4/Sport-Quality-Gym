package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_clientes_membresias")
public class VistaClientesMembresia {
    @Id
    @Getter @Setter @Column(name = "id_cliente")
    private int id_cliente;
    @Getter @Setter @Column(name = "cliente")
    private String cliente;
    @Getter @Setter @Column(name = "telefono")
    private String telefono;
    @Getter @Setter @Column(name = "fecha_registro")
    private String fecha_registro;
    @Getter @Setter @Column(name = "estado_cliente")
    private String estado_cliente;
    @Getter @Setter @Column(name = "id_membresia")
    private Integer id_membresia;
    @Getter @Setter @Column(name = "plan")
    private String plan;
    @Getter @Setter @Column(name = "fecha_inicio")
    private String fecha_inicio;
    @Getter @Setter @Column(name = "fecha_vencimiento")
    private String fecha_vencimiento;
    @Getter @Setter @Column(name = "estado_membresia")
    private String estado_membresia;
}
