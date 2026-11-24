package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_estado_membresias")
public class VistaEstadoMembresias {
    @Id
    @Getter @Setter @Column(name = "id_cliente")
    private int id_cliente;
    @Getter @Setter @Column(name = "cliente")
    private String cliente;
    @Getter @Setter @Column(name = "plan")
    private String plan;
    @Getter @Setter @Column(name = "fecha_inicio")
    private String fecha_inicio;
    @Getter @Setter @Column(name = "fecha_vencimiento")
    private String fecha_vencimiento;
    @Getter @Setter @Column(name = "estado")
    private String estado;
    @Getter @Setter @Column(name = "dias_restantes")
    private int dias_restantes;
}
