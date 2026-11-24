package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "corte_caja")
public class Corte_caja {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_usuario")
    private int id_usuario;
    @Getter @Setter @Column(name = "fecha_apertura")
    private String fecha_apertura;
    @Getter @Setter @Column(name = "fecha_cierre")
    private String fecha_cierre;
    @Getter @Setter @Column(name = "total_ventas")
    private String total_ventas;
    @Getter @Setter @Column(name = "monto_calculado")
    private String monto_calculado;
    @Getter @Setter @Column(name = "monto_real")
    private String monto_real;
    @Getter @Setter @Column(name = "diferencia")
    private String diferencia;
}
