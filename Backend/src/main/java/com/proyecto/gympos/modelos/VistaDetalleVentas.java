package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_detalle_ventas")
public class VistaDetalleVentas {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id_venta")
    private int id_venta;
    @Getter @Setter @Column(name = "fecha")
    private String fecha;
    @Getter @Setter @Column(name = "empleado")
    private String empleado;
    @Getter @Setter @Column(name = "cliente")
    private String cliente;
    @Getter @Setter @Column(name = "articulo")
    private String articulo;
    @Getter @Setter @Column(name = "cantidad")
    private String cantidad;
    @Getter @Setter @Column(name = "precio_unitario")
    private String precio_unitario;
    @Getter @Setter @Column(name = "subtotal")
    private String subtotal;
    @Getter @Setter @Column(name = "total")
    private String total;
    @Getter @Setter @Column(name = "metodo_pago")
    private String metodo_pago;
}
