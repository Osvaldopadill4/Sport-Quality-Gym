package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "compra")
public class Compra {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id")
    private int id;
    @Getter @Setter @Column(name = "id_usuario")
    private int id_usuario;
    @Getter @Setter @Column(name = "id_proveedor")
    private int id_proveedor;
    @Getter @Setter @Column(name = "fecha")
    private String fecha;
    @Getter @Setter @Column(name = "total")
    private String total;
    @Getter @Setter @Column(name = "estado")
    private String estado;
}
