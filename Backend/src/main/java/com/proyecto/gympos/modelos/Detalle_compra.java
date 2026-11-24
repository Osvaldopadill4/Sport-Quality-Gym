package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_compra")
public class Detalle_compra {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_compra")
    private int id_compra;
    @Getter @Setter @Column(name = "id_producto")
    private int id_producto;
    @Getter @Setter @Column(name = "cantidad")
    private String cantidad;
    @Getter @Setter @Column(name = "costo_unitario")
    private String costo_unitario;
    @Getter @Setter @Column(name = "subtotal")
    private String subtotal;
}
