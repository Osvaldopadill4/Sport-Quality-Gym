package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_venta")
public class Detalle_venta {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_venta")
    private int id_venta;
    @Getter @Setter @Column(name = "id_producto")
    private Integer id_producto;
    @Getter @Setter @Column(name = "id_plan")
    private Integer id_plan;
    @Getter @Setter @Column(name = "cantidad")
    private String cantidad;
    @Getter @Setter @Column(name = "precio_unitario")
    private String precio_unitario;
    @Getter @Setter @Column(name = "subtotal")
    private String subtotal;

}
