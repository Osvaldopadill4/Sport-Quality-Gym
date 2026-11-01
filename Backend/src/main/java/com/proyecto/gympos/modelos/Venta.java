package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "venta")
public class Venta {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_usuario")
    private Integer id_usuario;
    @Getter @Setter @Column(name = "id_cliente")
    private Integer id_cliente;
    @Getter @Setter @Column(name = "fecha")
    private String fecha;
    @Getter @Setter @Column(name = "total")
    private String total;
    @Getter @Setter @Column(name = "metodo_pago")
    private String metodo_pago;
    @Getter @Setter @Column(name = "folio")
    private String folio;
    @Getter @Setter @Column(name = "estado")
    private String estado;
}
